import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, TrendingUp, ChevronRight } from 'lucide-react';
import { getAttendanceReport, getSubjects } from '../../services/api';

export default function AttendanceTracker() {
    const [filters, setFilters] = useState({ batch: '2024-2028', branch: 'CSE', specialization: 'Core' });
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [curriculum, setCurriculum] = useState({});

    useEffect(() => {
        const fetchCurriculum = async () => {
            try {
                const { data } = await getSubjects();
                setCurriculum(data);
            } catch (err) {
                console.error("Failed to fetch curriculum", err);
            }
        };
        fetchCurriculum();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { data } = await getAttendanceReport(filters);
            setReport(data);
        } catch (err) {
            console.error('Report failed', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Attendance Tracker</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Live Student Monitoring • Batch Analytics</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchReport} className="px-5 py-2.5 bg-apollo-red text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/10 hover:scale-105 transition-all">
                        Refresh Report
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Admission Batch</label>
                        <select
                            value={filters.batch}
                            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                        >
                            <option>2024-2028</option>
                            <option>2023-2027</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                        <select
                            value={filters.branch}
                            onChange={(e) => {
                                const newBranch = e.target.value;
                                const specs = curriculum[newBranch] ? Object.keys(curriculum[newBranch]) : [];
                                setFilters({
                                    ...filters,
                                    branch: newBranch,
                                    specialization: specs.length > 0 ? specs[0] : ''
                                });
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                        >
                            {Object.keys(curriculum).length > 0 ? (
                                Object.keys(curriculum).map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))
                            ) : (
                                <>
                                    <option>CSE</option>
                                    <option>ECE</option>
                                    <option>EEE</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specialization</label>
                        <select
                            value={filters.specialization}
                            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                        >
                            {curriculum[filters.branch] ? (
                                Object.keys(curriculum[filters.branch]).map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))
                            ) : (
                                <option value="">No Specialization</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div></div>
                    ) : report.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 italic font-medium">No students found matching these filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Percentage</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.map(student => {
                                        const present = student.attendance.filter(a => a.status === 'Present').length;
                                        const totalMarked = student.attendance.filter(a => a.status === 'Present' || a.status === 'Absent').length;
                                        const percent = totalMarked > 0 ? ((present / totalMarked) * 100).toFixed(0) : 0;
                                        return (
                                            <tr key={student.rollNo} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 text-xs font-bold text-slate-600 font-mono">{student.rollNo}</td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">{student.name[0]}</div>
                                                        <span className="text-xs font-black text-slate-800">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{student.section}</td>
                                                <td className="py-4">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className={`text-[10px] font-black ${percent >= 75 ? 'text-emerald-500' : 'text-apollo-red'}`}>{percent}%</span>
                                                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${percent >= 75 ? 'bg-emerald-500' : 'bg-apollo-red'}`} style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button className="text-apollo-red opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={18} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
