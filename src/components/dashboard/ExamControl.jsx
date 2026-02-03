import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudents, getResults, updateMarks, publishResults, getPublishStatus } from '../../services/api';
import { Save, Search, CheckCircle2, Lock, Unlock, AlertCircle } from 'lucide-react';

export default function ExamControl() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('entry'); // 'entry' or 'publish'

    // Marks Entry State
    const [batch, setBatch] = useState('2024-2028');
    const [branch, setBranch] = useState('CSE');
    const [semester, setSemester] = useState('Sem 1');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Publish State
    const [publishConfig, setPublishConfig] = useState({});

    useEffect(() => {
        if (activeTab === 'publish') {
            fetchPublishStatus();
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        setLoading(true);
        // This should conceptually fetch students by batch/branch
        // For now, we simulate by fetching all and filtering
        try {
            // In a real app, we'd have an API filter. Here we fetch all and find one for demo
            const { data } = await getStudents();
            // Simplification: Just show a search or list. 
            // We'll filter the big list for now.
            const filtered = Object.values(data?.[batch]?.[branch] || []).flat(); // This is rough based on users.json structure
            // Actually currently getStudents returns full global directory structure or similar.
            // Let's rely on finding a student by Email for direct entry to start.
        } catch (e) { }
        setLoading(false);
    };

    const fetchStudentResults = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            const { data } = await getResults(selectedStudent);
            // If no data, we might need to initialize 'marks' structure based on curriculum
            // For this demo, let's just edit existing or add new rows if empty
            setMarks(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMark = (index, field, value) => {
        const newMarks = [...marks];
        let numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) numValue = 0;

        // Validation limits
        if (field === 'internal' && numValue > 40) {
            alert("Internal marks cannot exceed 40");
            numValue = 40;
        }
        if (field === 'external' && numValue > 60) {
            alert("External marks cannot exceed 60");
            numValue = 60;
        }

        newMarks[index][field] = numValue;

        // Auto calc total/grade?
        const int = parseFloat(newMarks[index].internal || 0);
        const ext = parseFloat(newMarks[index].external || 0);
        newMarks[index].total = int + ext;

        // Simple grading logic
        if (newMarks[index].total >= 90) newMarks[index].grade = 'O';
        else if (newMarks[index].total >= 80) newMarks[index].grade = 'A+';
        else if (newMarks[index].total >= 70) newMarks[index].grade = 'A';
        else if (newMarks[index].total >= 60) newMarks[index].grade = 'B+';
        else if (newMarks[index].total >= 50) newMarks[index].grade = 'B';
        else newMarks[index].grade = 'F';

        setMarks(newMarks);
    };

    const saveMarks = async () => {
        if (!selectedStudent) return;
        try {
            await updateMarks({ email: selectedStudent, results: marks });
            alert('Marks saved successfully');
        } catch (e) {
            alert('Failed to save marks');
        }
    };

    const fetchPublishStatus = async () => {
        const { data } = await getPublishStatus();
        setPublishConfig(data);
    };

    const togglePublish = async (batch, semester, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'Unpublish' : 'Publish'} results for ${batch} ${semester}?`)) return;
        try {
            await publishResults({ batch, semester, status: !currentStatus });
            fetchPublishStatus();
        } catch (e) {
            alert('Action failed');
        }
    };

    const [viewMode, setViewMode] = useState(user.role === 'teacher' ? 'class' : 'entry');
    const [selectedClassSubject, setSelectedClassSubject] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [batchMarkData, setBatchMarkData] = useState({}); // { email: { internal, external, ... } }

    const fetchBatchStudentsAndMarks = async (sub) => {
        setLoading(true);
        try {
            // 1. Get all students
            const { data: allStudents } = await getStudents();
            // 2. Filter by subject batch/branch/sem
            // Assuming getStudents returns a flat list now (after our admin.js fix)
            const filtered = allStudents.filter(s =>
                s.batch === sub.batch &&
                s.branch === sub.branch &&
                s.semester === sub.semester
            );
            setBatchStudents(filtered);

            // 3. Get existing marks
            const emails = filtered.map(s => s.email);
            const { data: existingMarks } = await import('../../services/api').then(m => m.batchViewResults({
                students: emails,
                subject: sub.subject
            }));

            // 4. Initialize Data
            const initialData = {};
            filtered.forEach(s => {
                const exist = existingMarks[s.email] || {};
                initialData[s.email] = {
                    internal: exist.internal || 0,
                    external: exist.external || 0,
                    total: exist.total || 0,
                    grade: exist.grade || 'F',
                    credits: 3, // Default or fetch from somewhere
                    semester: sub.semester,
                    code: exist.code || 'SUB000'
                };
            });
            setBatchMarkData(initialData);

        } catch (e) {
            console.error("Batch fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchMarkChange = (email, field, value) => {
        let numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) numValue = 0;

        // Validation limits
        if (field === 'internal' && numValue > 40) {
            alert("Internal marks cannot exceed 40");
            numValue = 40;
        }
        if (field === 'external' && numValue > 60) {
            alert("External marks cannot exceed 60");
            numValue = 60;
        }

        setBatchMarkData(prev => {
            const studentData = { ...prev[email] };
            studentData[field] = numValue;

            // Calc total
            studentData.total = (parseFloat(studentData.internal) || 0) + (parseFloat(studentData.external) || 0);

            // Grade
            const t = studentData.total;
            if (t >= 90) studentData.grade = 'O';
            else if (t >= 80) studentData.grade = 'A+';
            else if (t >= 70) studentData.grade = 'A';
            else if (t >= 60) studentData.grade = 'B+';
            else if (t >= 50) studentData.grade = 'B';
            else studentData.grade = 'F';

            return { ...prev, [email]: studentData };
        });
    };

    const saveBatchMarks = async () => {
        if (!selectedClassSubject) return;
        setLoading(true);
        try {
            const records = Object.entries(batchMarkData).map(([email, data]) => ({
                email, ...data
            }));

            await import('../../services/api').then(m => m.batchUpdateMarks({
                records,
                subject: selectedClassSubject.subject
            }));
            alert('Class marks saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save batch marks');
        } finally {
            setLoading(false);
        }
    };

    // ... existing helpers ...

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Exam Control Center</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                        {user.role === 'coe' ? 'Controller of Examinations' : 'Faculty Grading Portal'}
                    </p>
                </div>
                {user.role === 'coe' && (
                    <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
                        <button
                            onClick={() => setActiveTab('entry')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'entry' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Marks Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('publish')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'publish' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Publishing
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'entry' && viewMode === 'class' && user.role === 'teacher' && (
                <div className="space-y-8">
                    {/* Class Selector / Header */}
                    <div className="flex items-center justify-between">
                        {selectedClassSubject ? (
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setSelectedClassSubject(null); setBatchMarkData({}); }} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-apollo-red transition-all">
                                    <span className="sr-only">Back</span>
                                    ←
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedClassSubject.subject}</h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{selectedClassSubject.batch} • {selectedClassSubject.branch} • {selectedClassSubject.semester}</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My Classes</h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Select a subject to grade</p>
                            </div>
                        )}

                        <button onClick={() => setViewMode('student')} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Switch to Student View
                        </button>
                    </div>

                    {!selectedClassSubject ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(user.assignedSubjects || []).map((sub, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedClassSubject(sub); fetchBatchStudentsAndMarks(sub); }}
                                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-apollo-red hover:shadow-md transition-all text-left group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-apollo-red group-hover:text-white transition-all">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase tracking-widest text-slate-500">{sub.branch}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{sub.subject}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{sub.batch} • {sub.semester}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Student Grading Registry</h3>
                                <button onClick={saveBatchMarks} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2">
                                    <Save size={14} /> Publish Grades
                                </button>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Internal (40)</th>
                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">External (60)</th>
                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {batchStudents.map(student => {
                                            const data = batchMarkData[student.email] || { internal: 0, external: 0, total: 0, grade: 'F' };
                                            return (
                                                <tr key={student.email} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-700">{student.name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.rollNo}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-white border border-slate-200 rounded-lg py-1 text-center text-xs font-bold focus:border-apollo-red focus:outline-none"
                                                            value={data.internal}
                                                            onChange={(e) => handleBatchMarkChange(student.email, 'internal', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-white border border-slate-200 rounded-lg py-1 text-center text-xs font-bold focus:border-apollo-red focus:outline-none"
                                                            value={data.external}
                                                            onChange={(e) => handleBatchMarkChange(student.email, 'external', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-xs font-black text-slate-700">{data.total}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${data.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                            {data.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {batchStudents.length === 0 && !loading && (
                                    <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase">No students found for this class.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'entry' && viewMode !== 'class' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student Selector */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 h-fit">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Select Student</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Student Email</label>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        placeholder="student@apollo.edu"
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-apollo-red"
                                        value={selectedStudent || ''}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                    />
                                    <button
                                        onClick={fetchStudentResults}
                                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold" value={batch} onChange={e => setBatch(e.target.value)}>
                                        <option value="2024-2028">Batch 2024-2028</option>
                                    </select>
                                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-bold" value={semester} onChange={e => setSemester(e.target.value)}>
                                        <option value="Sem 1">Sem 1</option>
                                        <option value="Sem 2">Sem 2</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marks Editor */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Grading Sheet</h3>
                            <button onClick={saveMarks} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                                <Save size={14} /> Save Changes
                            </button>
                        </div>

                        {marks.length > 0 ? (
                            <div className="p-4">
                                <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="col-span-4">Subject</div>
                                    <div className="col-span-2 text-center">Internal (40)</div>
                                    <div className="col-span-2 text-center">External (60)</div>
                                    <div className="col-span-2 text-center">Total (100)</div>
                                    <div className="col-span-2 text-center">Grade</div>
                                </div>
                                <div className="space-y-2">
                                    {marks.filter(m => m.semester === semester).map((mark, idx) => {
                                        // Teacher Restriction
                                        const isTeacher = user.role === 'teacher';
                                        const allowedSubjects = isTeacher ? (user.assignedSubjects?.map(s => s.subject) || []) : null;
                                        const isEditable = !isTeacher || (allowedSubjects && allowedSubjects.includes(mark.course));

                                        return (
                                            <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${isEditable ? 'bg-slate-50 border-slate-100' : 'bg-slate-100/50 border-transparent opacity-60'}`}>
                                                <div className="col-span-4">
                                                    <p className="text-[10px] font-bold text-slate-700">{mark.course} {!isEditable && <Lock size={10} className="inline ml-1 opacity-50" />}</p>
                                                    <p className="text-[8px] font-black text-slate-400">{mark.code}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        className="w-full text-center bg-white border border-slate-200 rounded-lg py-1.5 text-xs font-bold focus:border-apollo-red focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                                        value={mark.internal}
                                                        onChange={(e) => handleUpdateMark(idx, 'internal', e.target.value)}
                                                        disabled={!isEditable}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        className="w-full text-center bg-white border border-slate-200 rounded-lg py-1.5 text-xs font-bold focus:border-apollo-red focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                                        value={mark.external}
                                                        onChange={(e) => handleUpdateMark(idx, 'external', e.target.value)}
                                                        disabled={!isEditable}
                                                    />
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className="text-xs font-black text-slate-700">{mark.total}</span>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${mark.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {mark.grade}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                    {user.role !== 'teacher' && (
                                        <button onClick={addNewSubjectRow} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-apollo-red transition-colors">
                                            + Add Subject Row manually
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                                <AlertCircle size={32} className="mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">Select a student to begin grading</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'publish' && user.role === 'coe' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Result Publication Protocol</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorize release of examination results</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {['2024-2028'].map(b => (
                                <div key={b} className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Batch {b}</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Sem 1', 'Sem 2'].map(sem => {
                                            const isPub = publishConfig[b]?.[sem]?.published;
                                            return (
                                                <div key={sem} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPub ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            {isPub ? <Unlock size={16} /> : <Lock size={16} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight">{sem} Results</h4>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isPub ? 'Live & Accessible' : 'Private / Hidden'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePublish(b, sem, isPub)}
                                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPub ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg'}`}
                                                    >
                                                        {isPub ? 'Unpublish' : 'Publish Now'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
