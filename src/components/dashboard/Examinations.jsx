import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, Clock, MapPin,
    Download, Printer, AlertCircle,
    CheckCircle2, ChevronRight, Calculator,
    ShieldAlert, HelpCircle, Plus, Trash2, Save, X, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getExams, createExam, deleteExam, getSubjects } from '../../services/api';

const HallTicket = ({ student, exam }) => {
    const handlePrint = () => window.print();

    return (
        <div className="bg-white border-4 border-slate-900 p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden print:shadow-none print:border-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 text-white flex items-center justify-center -mr-10 -mt-10 rotate-45">
                <span className="font-black text-[10px] uppercase tracking-widest mb-4">Official</span>
            </div>

            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
                <div className="flex gap-6 items-center">
                    <img src="/apollo.png" alt="Apollo" className="h-20 w-20 object-contain" />
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Apollo University</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Official Examination Hall Ticket</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest">
                        {exam.type} • {exam.batch}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Issued on: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-10 bg-slate-50 p-8 rounded-3xl">
                <div className="space-y-4">
                    <div className="border-l-4 border-apollo-red pl-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Name</p>
                        <h3 className="text-xl font-black text-slate-900 uppercase">{student.name}</h3>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                        <h3 className="text-sm font-black text-slate-700 font-mono tracking-widest">{student.rollNo || student.id}</h3>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="border-l-4 border-slate-900 pl-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</p>
                        <h3 className="text-sm font-black text-slate-700 uppercase">{student.branch} • {student.specialization}</h3>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Status</p>
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                            <CheckCircle2 size={12} /> Verified & Eligible
                        </h3>
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse mb-10">
                <thead>
                    <tr className="bg-slate-900 text-white">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-left">Code</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-left">Subject Paper</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-left">Date</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-left">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {exam.schedule.map((row, i) => (
                        <tr key={i} className="bg-white">
                            <td className="py-4 px-6 text-xs font-bold text-slate-500 font-mono">{row.code}</td>
                            <td className="py-4 px-6 text-xs font-black text-slate-800">{row.name}</td>
                            <td className="py-4 px-6 text-xs font-bold text-slate-600">{row.date}</td>
                            <td className="py-4 px-6 text-xs font-bold text-slate-600">{row.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-end">
                <div className="max-w-xs text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                    Instruction: Verification of IDs will happen at the entrance. Malpractice leads to immediate suspension of portal access.
                </div>
                <div className="text-center">
                    <div className="w-40 h-16 border-b-2 border-slate-300 mb-2"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Controller of Exams</p>
                </div>
            </div>

            <button onClick={handlePrint} className="mt-10 w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all print:hidden">
                <Printer size={16} /> Print hall ticket
            </button>
        </div>
    );
};

export default function Examinations() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'coe'].includes(user?.role);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showHallTicket, setShowHallTicket] = useState(null);
    const [curriculum, setCurriculum] = useState({});

    // Create Form State
    const [newExam, setNewExam] = useState({
        type: 'Mid 1',
        batch: '2024-2028',
        branch: 'CSE',
        specialization: 'Core',
        schedule: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examRes, currRes] = await Promise.all([getExams(), getSubjects()]);
            setExams(examRes.data);
            setCurriculum(currRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async () => {
        if (newExam.schedule.length === 0) {
            alert('Add at least one subject to the schedule');
            return;
        }
        try {
            await createExam(newExam);
            setShowCreate(false);
            fetchData();
        } catch (err) {
            alert('Failed to create exam');
        }
    };

    const addSubjectToSchedule = () => {
        setNewExam({
            ...newExam,
            schedule: [...newExam.schedule, { name: '', code: '', date: '', time: '09:00 AM - 12:00 PM', venue: 'Exams Hall A' }]
        });
    };

    // Auto-populate subjects
    useEffect(() => {
        const isBulkType = ['Lab External', 'External Sem'].includes(newExam.type);
        if (isBulkType && newExam.semester && newExam.branch && curriculum[newExam.branch]) {
            const spec = newExam.specialization || Object.keys(curriculum[newExam.branch])[0];
            const semData = curriculum[newExam.branch][spec]?.[newExam.semester];

            if (semData) {
                let subjects = [];
                if (newExam.type === 'Lab External' && semData.labs) {
                    subjects = semData.labs.map((lab, i) => ({
                        name: lab,
                        code: `LAB${100 + i}`, // Mock code if not in data 
                        date: '',
                        time: '09:00 AM - 12:00 PM',
                        venue: 'Lab Complex'
                    }));
                } else if (newExam.type === 'External Sem' && semData.theory) {
                    subjects = semData.theory.map((sub, i) => ({
                        name: sub,
                        code: `SUB${100 + i}`,
                        date: '',
                        time: '10:00 AM - 01:00 PM',
                        venue: 'Exam Hall'
                    }));
                }

                if (subjects.length > 0) {
                    if (window.confirm(`Auto-fill ${subjects.length} subjects for ${newExam.semester}? Existing schedule will be replaced.`)) {
                        setNewExam(prev => ({ ...prev, schedule: subjects }));
                    }
                }
            }
        }
    }, [newExam.type, newExam.semester, newExam.branch, newExam.specialization]);

    const updateScheduleRow = (index, field, value) => {
        const updated = [...newExam.schedule];
        updated[index][field] = value;
        setNewExam({ ...newExam, schedule: updated });
    };

    const removeScheduleRow = (index) => {
        setNewExam({ ...newExam, schedule: newExam.schedule.filter((_, i) => i !== index) });
    };

    const myExams = exams.filter(e => e.batch === user?.batch && e.branch === user?.branch && (e.specialization === user?.specialization || !e.specialization));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
        </div>
    );

    if (showHallTicket) return (
        <div className="p-4">
            <button onClick={() => setShowHallTicket(null)} className="mb-6 flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase transition-all">
                <X size={16} /> Close Preview
            </button>
            <HallTicket student={user} exam={showHallTicket} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Examinations</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Term: ODD SEM 2025-26 • Academic Cycle 04</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
                        <Plus size={16} className="text-apollo-red" /> Create Examination
                    </button>
                )}
            </div>

            {isAdmin ? (
                <div className="space-y-6">
                    {exams.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Examinations Created Yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                                    <button onClick={async () => { if (window.confirm('Delete exam?')) { await deleteExam(exam.id); fetchData(); } }} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-red-50 text-apollo-red rounded-2xl flex items-center justify-center">
                                            <Calculator size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{exam.type}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.batch} • {exam.branch}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Papers Registered</p>
                                        <div className="flex flex-wrap gap-2">
                                            {exam.schedule.map((s, idx) => (
                                                <div key={idx} className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-600">{s.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Warning Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-5 items-start">
                        <div className="p-2 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20"><ShieldAlert size={20} /></div>
                        <div className="flex-1">
                            <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">Code of Conduct</h5>
                            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                                Physical IDs and Hall Tickets are MANDATORY. Mobile devices are strictly prohibited in the exam hall.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {myExams.length > 0 ? (
                            myExams.map(exam => (
                                <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-900 text-apollo-red rounded-2xl flex items-center justify-center shadow-2xl">
                                            <FileText size={32} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-apollo-red uppercase tracking-widest">{exam.type} • SESSION 2026</span>
                                            <h3 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">Official Hall Ticket</h3>
                                            <p className="text-xs font-bold text-slate-400">Eligibility Status: <span className="text-emerald-500">QUALIFIED</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowHallTicket(exam)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                                            <Printer size={14} className="text-apollo-red" /> View & Print
                                        </button>
                                        <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
                                <ShieldAlert size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Exam Schedules Found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Exam Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowCreate(false)}>
                    <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Construct Examination</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Academic Node Registry • New Session</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-apollo-red transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Category</label>
                                    <select value={newExam.type} onChange={e => setNewExam({ ...newExam, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20">
                                        <option>Mid 1</option>
                                        <option>Mid 2</option>
                                        <option>Mid 3</option>
                                        <option>Lab External</option>
                                        <option>External Sem</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Batch</label>
                                    <select value={newExam.batch} onChange={e => setNewExam({ ...newExam, batch: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20">
                                        <option>2024-2028</option>
                                        <option>2023-2027</option>
                                        <option>2022-2026</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                    <select value={newExam.branch} onChange={e => setNewExam({ ...newExam, branch: e.target.value, specialization: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20">
                                        {Object.keys(curriculum).map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                                    <select value={newExam.specialization} onChange={e => setNewExam({ ...newExam, specialization: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20">
                                        <option value="">All Tracks</option>
                                        {curriculum[newExam.branch] && Object.keys(curriculum[newExam.branch]).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                {['Lab External', 'External Sem'].includes(newExam.type) && (
                                    <div className="space-y-2 md:col-span-4 lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester Context</label>
                                        <select value={newExam.semester || ''} onChange={e => setNewExam({ ...newExam, semester: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20 focus:bg-amber-50 focus:border-amber-200 transition-colors">
                                            <option value="">Select Semester</option>
                                            {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(em => (
                                                <option key={em} value={em}>{em}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Examination Schedule</h3>
                                    <button onClick={addSubjectToSchedule} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-105 transition-all">
                                        <Plus size={12} /> Add Paper
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {newExam.schedule.map((row, idx) => (
                                        <div key={idx} className="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl relative group">
                                            <button onClick={() => removeScheduleRow(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Subject Name</label>
                                                <input type="text" placeholder="e.g. Data Structures" value={row.name} onChange={e => updateScheduleRow(idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                            </div>
                                            <div className="w-24 space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Code</label>
                                                <input type="text" placeholder="CS201" value={row.code} onChange={e => updateScheduleRow(idx, 'code', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                            </div>
                                            <div className="w-32 space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Date</label>
                                                <input type="date" value={row.date} onChange={e => updateScheduleRow(idx, 'date', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                            </div>
                                            <div className="w-40 space-y-2">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Time Slot</label>
                                                <input type="text" value={row.time} onChange={e => updateScheduleRow(idx, 'time', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                            <button onClick={() => setShowCreate(false)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                            <button onClick={handleCreateExam} className="px-10 py-3 bg-apollo-red text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2">
                                <Save size={14} /> Publish Exam & Hall Tickets
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
