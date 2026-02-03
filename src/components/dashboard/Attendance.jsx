import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAttendance, getSubjects, updateAttendance, getStudents, bulkAttendance } from '../../services/api';
import {
    ChevronRight, ArrowLeft, Filter, Download, Plus,
    Edit2, Calendar as CalendarIcon, PieChart as PieChartIcon,
    AlertCircle, CheckCircle2, MoreVertical, ChevronDown, Search, Clock,
    LayoutList, Save, X, Users, CalendarDays, Zap
} from 'lucide-react';

const BulkAddModal = ({ email, subjects, onClose, onSuccess }) => {
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [loading, setLoading] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const toggleMonth = (idx) => {
        if (selectedMonths.includes(idx)) {
            setSelectedMonths(selectedMonths.filter(m => m !== idx));
        } else {
            setSelectedMonths([...selectedMonths, idx]);
        }
    };

    const handleGenerate = async () => {
        if (selectedMonths.length === 0) return alert("Select at least one month");
        setLoading(true);
        try {
            await bulkAttendance({ email, months: selectedMonths, subjects });
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to generate logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Bulk Initialize Logs</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Generate session dates for selected months</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-apollo-red transition-all"><X size={20} /></button>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {months.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => toggleMonth(i)}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedMonths.includes(i)
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                        <Zap className="text-blue-500 mt-1" size={18} />
                        <div>
                            <p className="text-xs font-bold text-blue-900">System Logic</p>
                            <p className="text-[10px] font-medium text-blue-700 mt-1 leading-relaxed">
                                This will generate "Not Marked" records for every weekday (Mon-Fri) in the selected months for all {subjects.length} current curriculum subjects.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cancel</button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || selectedMonths.length === 0}
                        className="flex-1 py-3 bg-apollo-red text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CalendarDays size={14} />}
                        Log {selectedMonths.length} Months
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditAttendanceModal = ({ record, email, onClose, onSuccess }) => {
    const [status, setStatus] = useState(record.status);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedRecord = { ...record, status };
            await updateAttendance({
                email,
                originalRecord: record,
                updatedRecord
            });
            onSuccess();
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Modify Attendance</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{record.subject} • {record.date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-apollo-red transition-all"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Override Status</label>
                        <div className="grid grid-cols-1 gap-2">
                            {['Present', 'Absent', 'Not Marked'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest border-2 flex items-center justify-between transition-all ${status === s
                                        ? 'bg-apollo-red border-apollo-red text-white shadow-lg shadow-red-500/20'
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    {s}
                                    {status === s && <CheckCircle2 size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all font-sans">Discard</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 font-sans"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                        Confirm Update
                    </button>
                </div>
            </div>
        </div>
    );
};

const AttendanceRecordRow = ({ date, status, subject, isStaff, onEdit }) => {
    const statusLower = status?.toLowerCase();
    const isPresent = statusLower === 'present';
    const isAbsent = statusLower === 'absent';

    return (
        <div className="p-4 border-b border-slate-50 last:border-0 flex items-center justify-between group hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPresent ? 'bg-emerald-50 text-emerald-600' :
                    isAbsent ? 'bg-red-50 text-apollo-red' : 'bg-slate-50 text-slate-400'
                    }`}>
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isPresent ? 'bg-emerald-100 text-emerald-700' :
                    isAbsent ? 'bg-red-100 text-apollo-red' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {status === 'Not Marked' ? 'NOT MARKED' : status}
                </span>
                {isStaff && (
                    <button
                        onClick={() => onEdit({ date, status, subject })}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-apollo-red hover:border-apollo-red rounded-lg transition-all shadow-sm"
                        title="Edit Record"
                    >
                        <Edit2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

const SubjectDetailView = ({ subject, records, onBack, isStaff, onEdit, context }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-apollo-red transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{subject}</h2>
                            {context && <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded uppercase tracking-widest">{context}</span>}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Session Logs</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-4 grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <div className="col-span-5">Timestamp</div>
                    <div className="col-span-4 text-center">Final Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-100">
                    {records.map((rec, i) => {
                        const isPresent = rec.status?.toLowerCase() === 'present';
                        const isAbsent = rec.status?.toLowerCase() === 'absent';

                        return (
                            <div key={i} className="grid grid-cols-12 items-center p-4 hover:bg-slate-50 transition-all font-sans group">
                                <div className="col-span-5 text-sm font-bold text-slate-700">{rec.date}</div>
                                <div className="col-span-4 text-center">
                                    <span className={`text-[11px] font-black uppercase ${isPresent ? 'text-emerald-500' : isAbsent ? 'text-apollo-red' : 'text-slate-400'}`}>
                                        {rec.status}
                                    </span>
                                </div>
                                <div className="col-span-3 flex justify-end">
                                    {isStaff && (
                                        <button
                                            onClick={() => onEdit(rec)}
                                            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-apollo-red transition-all shadow-md"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function Attendance() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [records, setRecords] = useState([]);
    const [curriculumSubjects, setCurriculumSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showBulkAdd, setShowBulkAdd] = useState(false);

    const isStaff = ['admin', 'teacher', 'dean'].includes(user?.role);

    useEffect(() => {
        if (isAdmin || user.role === 'teacher') {
            getStudents().then(res => setStudents(res.data)).finally(() => setLoading(false));
        } else {
            fetchStudentData(user.email, user);
        }
    }, [user, isAdmin]);

    const fetchStudentData = async (email, studentUser) => {
        setLoading(true);
        try {
            const [attnRes, subRes] = await Promise.all([
                getAttendance(email),
                getSubjects()
            ]);
            const allRecords = attnRes.data || [];

            // Teacher Restriction Logic
            const isTeacher = user.role === 'teacher';
            const allowedSubjects = isTeacher ? (user.assignedSubjects?.map(s => s.subject) || []) : null;

            if (isTeacher && allowedSubjects) {
                setRecords(allRecords.filter(r => allowedSubjects.includes(r.subject)));
            } else {
                setRecords(allRecords);
            }

            const branch = studentUser.branch || studentUser.department;
            const spec = studentUser.specialization || 'Core';
            const sem = studentUser.semester || 'Sem 1';

            const branchData = subRes.data?.[branch] || {};
            const specData = branchData[spec] || {};
            const semData = specData[sem] || { theory: [], labs: [] };

            let allSub = [...(semData.theory || []), ...(semData.labs || [])];

            if (isTeacher && allowedSubjects) {
                allSub = allSub.filter(s => allowedSubjects.includes(s));
            }

            setCurriculumSubjects(allSub);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        fetchStudentData(student.email, student);
    };

    const [viewMode, setViewMode] = useState('class'); // 'class' or 'student' for teachers
    const [selectedClassSubject, setSelectedClassSubject] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [classAttendanceData, setClassAttendanceData] = useState({}); // { email: status }

    // ... existing filter logic ...
    const filteredStudents = students.filter(s => {
        // Basic Search
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Teacher Restriction
        if (user.role === 'teacher') {
            const assigned = user.assignedSubjects || [];

            // If a specific class subject is selected, filter by that
            if (selectedClassSubject) {
                return (
                    selectedClassSubject.batch === s.batch &&
                    selectedClassSubject.branch === s.branch &&
                    selectedClassSubject.semester === s.semester // && section logic if added
                );
            }

            // Otherwise show all students relevant to ANY assigned subject (for student list view)
            const isRelevant = assigned.some(assign =>
                assign.batch === s.batch &&
                assign.branch === s.branch &&
                assign.semester === s.semester
            );
            return isRelevant;
        }

        return true;
    });

    // Fetch batch attendance when date or subject changes
    useEffect(() => {
        if (selectedClassSubject && filteredStudents.length > 0) {
            fetchBatchAttendance();
        }
    }, [selectedClassSubject, selectedDate]);

    // Need to trigger this when students list also loads, or just rely on filteredStudents change if stable
    useEffect(() => {
        if (selectedClassSubject && filteredStudents.length > 0) {
            fetchBatchAttendance();
        }
    }, [filteredStudents.length]);

    const fetchBatchAttendance = async () => {
        if (!selectedClassSubject) return;
        setLoading(true);
        try {
            const emails = filteredStudents.map(s => s.email);
            const res = await import('../../services/api').then(m => m.getBatchAttendance({
                date: selectedDate,
                subject: selectedClassSubject.subject,
                students: emails
            }));
            setClassAttendanceData(res.data);
        } catch (err) {
            console.error("Failed batch fetch", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchSubmit = async () => {
        if (!selectedClassSubject) return;
        setLoading(true);
        try {
            const studentsToUpdate = Object.entries(classAttendanceData).map(([email, status]) => ({
                email, status
            }));

            await import('../../services/api').then(m => m.batchUpdateAttendance({
                date: selectedDate,
                subject: selectedClassSubject.subject,
                students: studentsToUpdate
            }));
            alert("Attendance saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentStatus = (email) => {
        setClassAttendanceData(prev => {
            const current = prev[email] || 'Not Marked';
            const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Present' : 'Present';
            return { ...prev, [email]: next };
        });
    };

    if (user.role === 'teacher' && !selectedStudent && viewMode === 'class') {
        // TEACHER CLASS VIEW
        const assigned = user.assignedSubjects || [];

        if (!selectedClassSubject) {
            return (
                <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Class Attendance</h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Select a class to mark attendance</p>
                        </div>
                        <button onClick={() => setViewMode('student')} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Switch to Student View
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assigned.map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedClassSubject(sub)}
                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-apollo-red hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-apollo-red group-hover:text-white transition-all">
                                        <Users size={24} />
                                    </div>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase tracking-widest text-slate-500">{sub.branch}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{sub.subject}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{sub.batch} • {sub.semester}</p>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => { setSelectedClassSubject(null); setClassAttendanceData({}); }} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-apollo-red transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedClassSubject.subject}</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                            {selectedClassSubject.batch} • {selectedClassSubject.branch} • {selectedClassSubject.semester}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar: Date Picker */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Session Date</h4>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-apollo-red transition-all"
                            />
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
                                    <span className="text-xs font-black text-emerald-600">
                                        {Object.values(classAttendanceData).filter(s => s === 'Present').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span>
                                    <span className="text-xs font-black text-apollo-red">
                                        {Object.values(classAttendanceData).filter(s => s === 'Absent').length}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleBatchSubmit}
                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={14} /> Save Logs
                            </button>
                        </div>
                    </div>

                    {/* Right: Student List */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Registry</h4>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const newData = {};
                                    filteredStudents.forEach(s => newData[s.email] = 'Present');
                                    setClassAttendanceData(newData);
                                }} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100">Mark All Present</button>
                                <button onClick={() => {
                                    const newData = {};
                                    filteredStudents.forEach(s => newData[s.email] = 'Absent');
                                    setClassAttendanceData(newData);
                                }} className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100">Mark All Absent</button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {filteredStudents.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase">No students found for this class configuration.</div>
                            ) : (
                                filteredStudents.map(student => {
                                    const status = classAttendanceData[student.email] || 'Not Marked';
                                    return (
                                        <div key={student.email} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                        status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {student.rollNo?.slice(-2) || student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.name}</h5>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.rollNo}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setClassAttendanceData(prev => ({ ...prev, [student.email]: 'Present' }))}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === 'Present' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => setClassAttendanceData(prev => ({ ...prev, [student.email]: 'Absent' }))}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === 'Absent' ? 'bg-apollo-red text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if ((isAdmin || user.role === 'teacher') && !selectedStudent) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Attendance Management</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Registry Node • Select a student to manage logs</p>
                    </div>
                    {user.role === 'teacher' && (
                        <button onClick={() => setViewMode('class')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                            Switch to Class View
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                        <Search className="text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Name, Roll No, or Email..."
                            className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-slate-700"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center"><div className="w-8 h-8 border-4 border-apollo-red border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                        ) : filteredStudents.map(student => (
                            <div key={student.email} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-apollo-red group-hover:text-white transition-all">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.rollNo || student.id} • {student.branch}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleSelectStudent(student)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Manage Node</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const present = records.filter(r => r.status?.toLowerCase() === 'present').length;
    const absent = records.filter(r => r.status?.toLowerCase() === 'absent').length;
    const markedTotal = present + absent;
    const totalRecords = records.length;
    const percent = markedTotal > 0 ? ((present / markedTotal) * 100).toFixed(1) : '0';

    const fullSubjectStats = records.reduce((acc, curr) => {
        if (!acc[curr.subject]) acc[curr.subject] = { name: curr.subject, present: 0, total: 0 };
        if (curr.status?.toLowerCase() !== 'not marked') {
            acc[curr.subject].total++;
            if (curr.status?.toLowerCase() === 'present') acc[curr.subject].present++;
        }
        return acc;
    }, curriculumSubjects.reduce((acc, sub) => ({ ...acc, [sub]: { name: sub, present: 0, total: 0 } }), {}));

    const subjects = Object.values(fullSubjectStats).map(s => ({
        ...s,
        percent: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '0.0'
    }));

    if (selectedSubject) {
        return (
            <div className="pb-20">
                <SubjectDetailView
                    subject={selectedSubject}
                    records={records.filter(r => r.subject === selectedSubject)}
                    onBack={() => setSelectedSubject(null)}
                    isStaff={isStaff}
                    onEdit={setEditingRecord}
                    context={selectedStudent ? `${selectedStudent.batch} • ${selectedStudent.branch} • ${selectedStudent.semester}` : null}
                />
                {editingRecord && (
                    <EditAttendanceModal
                        record={editingRecord}
                        email={selectedStudent?.email || user.email}
                        onClose={() => setEditingRecord(null)}
                        onSuccess={() => { setEditingRecord(null); fetchStudentData(selectedStudent?.email || user.email, selectedStudent || user); }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {(isAdmin || user.role === 'teacher') && (
                        <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-apollo-red transition-all">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Attendance Portal</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Viewing Data for: {selectedStudent?.name || user?.name}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowBulkAdd(true)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20"
                    >
                        <CalendarDays size={16} className="text-apollo-red" />
                        Initialize Months
                    </button>
                )}
            </div>

            {records.length === 0 && !loading && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 text-center animate-bounce-subtle">
                    <AlertCircle className="text-amber-500 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">Empty Attendance Node</h3>
                    <p className="text-sm text-amber-700 font-medium max-w-md mx-auto mt-2">
                        No attendance records found for this student. Use the "Initialize Months" tool to generate session dates.
                    </p>
                    <button
                        onClick={() => setShowBulkAdd(true)}
                        className="mt-6 px-8 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20"
                    >
                        Initialize Now
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Standing</p>
                    <h2 className="text-4xl font-black text-slate-900 mt-2">{percent}%</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions Present</p>
                    <h2 className="text-4xl font-black text-emerald-600 mt-2">{present} <span className="text-sm text-slate-300 font-bold">/ {markedTotal}</span></h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absence Registry</p>
                    <h2 className="text-4xl font-black text-apollo-red mt-2">{absent} <span className="text-sm text-slate-300 font-bold">Penalty Credits</span></h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Subject Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedSubject(sub.name)}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left group hover:border-apollo-red transition-all active:scale-95"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">{sub.name}</h4>
                                    <span className={`text-xs font-black ${parseFloat(sub.percent) >= 75 ? 'text-emerald-500' : 'text-apollo-red'}`}>{sub.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${parseFloat(sub.percent) >= 75 ? 'bg-emerald-500' : 'bg-apollo-red'}`} style={{ width: `${sub.percent}%` }}></div>
                                </div>
                                <div className="mt-3 flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{sub.present} Present</span>
                                    <span className="flex items-center gap-1">Open Logs <ChevronRight size={10} /></span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Registry</h2>
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[600px]">
                        <div className="flex-1 overflow-y-auto">
                            {records.length > 0 ? [...records].reverse().map((record, i) => (
                                <AttendanceRecordRow key={i} {...record} isStaff={isStaff} onEdit={setEditingRecord} />
                            )) : (
                                <div className="p-10 text-center text-slate-300 font-black uppercase text-[10px]">No logs synchronized</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {editingRecord && !selectedSubject && (
                <EditAttendanceModal
                    record={editingRecord}
                    email={selectedStudent?.email || user.email}
                    onClose={() => setEditingRecord(null)}
                    onSuccess={() => { setEditingRecord(null); fetchStudentData(selectedStudent?.email || user.email, selectedStudent || user); }}
                />
            )}
            {showBulkAdd && (
                <BulkAddModal
                    email={selectedStudent?.email || user.email}
                    subjects={curriculumSubjects}
                    onClose={() => setShowBulkAdd(false)}
                    onSuccess={() => {
                        setShowBulkAdd(false);
                        fetchStudentData(selectedStudent?.email || user.email, selectedStudent || user);
                    }}
                />
            )}
        </div>
    );
}
