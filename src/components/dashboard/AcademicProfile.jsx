import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getResults, getAttendance } from '../../services/api';
import {
    User, BookOpen, Award, BarChart3,
    Download, Printer, AlertCircle,
    CheckCircle2, ChevronRight, GraduationCap,
    Mail, Phone, MapPin, Calendar
} from 'lucide-react';

const ProfileStatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-current group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{value}</h3>
            {sub && <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{sub}</p>}
        </div>
    </div>
);

const ResultRow = ({ course, code, internal, external, total, grade }) => (
    <div className="grid grid-cols-12 items-center p-4 hover:bg-slate-50 transition-all border-b border-slate-50 group">
        <div className="col-span-6">
            <h6 className="text-sm font-black text-slate-700">{course}</h6>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{code}</span>
        </div>
        <div className="col-span-2 text-center text-xs font-bold text-slate-500">{internal}</div>
        <div className="col-span-2 text-center text-xs font-bold text-slate-500">{external}</div>
        <div className="col-span-2 flex flex-col items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${grade === 'A+' ? 'bg-emerald-100 text-emerald-600' :
                grade === 'A' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>{grade}</span>
            <span className="text-[9px] font-bold text-slate-400 mt-1">{total}/100</span>
        </div>
    </div>
);

export default function AcademicProfile() {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                const [resData, attnData] = await Promise.all([
                    getResults(user.email),
                    getAttendance(user.email)
                ]);
                setResults(resData.data || []);
                setAttendance(attnData.data || []);
            } catch (err) {
                console.error("Failed to fetch academic data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // CGPA Calculation Logic (Grade Points: O/A+=10, A=9, B=8, C=7, D=6, F=0)
    const getGradePoint = (grade) => {
        const points = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'P': 5, 'F': 0 };
        return points[grade] || 0;
    };

    const totalCredits = results.reduce((sum, res) => sum + (res.credits || 3), 0);
    const weightedPoints = results.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

    const attendancePercent = attendance.length > 0
        ? ((attendance.filter(a => a.status?.toLowerCase() === 'present').length / attendance.length) * 100).toFixed(1)
        : '0.0';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header: Personal Info & Identity */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1 w-full">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full ring-4 ring-slate-50 overflow-hidden shadow-2xl bg-slate-100">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=e33e33&color=fff&size=200&bold=true`} alt="" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">{user?.name}</h1>
                                <p className="text-[11px] font-black text-apollo-red uppercase tracking-[0.3em] mt-2">Roll No: {user?.rollNo || user?.id || 'PENDING'}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Program</p>
                                    <p className="text-xs font-bold text-slate-700">{user?.branch || 'General Architecture'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Specialization</p>
                                    <p className="text-xs font-bold text-slate-700">{user?.specialization || 'Core'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Term</p>
                                    <p className="text-xs font-bold text-slate-700">{user?.semester || 'Sem 1'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active Node</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500"><Mail size={12} /> {user?.email}</span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500"><Calendar size={12} /> Batch: {user?.batch || '2024'}</span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500"><MapPin size={12} /> Remote Campus</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="lg:w-72 w-full space-y-4">
                    <button className="w-full p-4 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-xl group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Download size={20} className="text-apollo-red" />
                            <span className="text-xs font-black uppercase tracking-widest">ID Card</span>
                        </div>
                        <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full p-4 bg-white border border-slate-200 hover:border-apollo-red text-slate-700 rounded-2xl transition-all shadow-sm group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Printer size={20} className="text-slate-400 group-hover:text-apollo-red" />
                            <span className="text-xs font-black uppercase tracking-widest">Transcript</span>
                        </div>
                        <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Academic Highlights / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ProfileStatCard label="Computed CGPA" value={`${cgpa} / 10`} sub="Real-time Calculation" icon={GraduationCap} color="bg-indigo-600" />
                <ProfileStatCard label="Live Attendance" value={`${attendancePercent} %`} sub="Current Term" icon={BarChart3} color="bg-emerald-600" />
                <ProfileStatCard label="Earned Credits" value={`${totalCredits} Units`} sub="Verified" icon={BookOpen} color="bg-blue-600" />
                <ProfileStatCard label="Status" value="Verified" sub="No Backlogs" icon={Award} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Notices */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Academic Notices</h3>
                        <AlertCircle size={16} className="text-apollo-red animate-pulse" />
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex gap-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 cursor-pointer hover:bg-red-50 transition-all">
                            <div className="text-red-500 mt-0.5"><Calendar size={18} /></div>
                            <div>
                                <h6 className="text-[11px] font-black text-slate-800 uppercase leading-tight">External Exam Dates Released</h6>
                                <p className="text-[10px] font-bold text-slate-500 mt-1">Starting soon. Review schedule.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Visual */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6">Course Progression</h3>
                        <div className="h-28 w-28 relative flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="50"
                                    stroke="#e33e33"
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 50}
                                    strokeDashoffset={2 * Math.PI * 50 * (1 - 0.15)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">15%</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Units: {totalCredits} / 180</p>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-apollo-red transition-all duration-1000" style={{ width: '15%' }}></div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-apollo-red/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            </div>
        </div>
    );
}
