import React, { useState, useEffect } from 'react';
import { GraduationCap, Zap, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getAttendance, getPendingRegistrations,
    getAdminStats, getSubjects, approveRegistration, rejectRegistration
} from '../../services/api';

// Sub-Dashboards
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import PendingDashboard from './PendingDashboard';

export default function Dashboard({ setActiveTab }) {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (['admin', 'coe'].includes(user?.role)) {
                const [statRes, subRes] = await Promise.all([
                    getAdminStats(),
                    getSubjects()
                ]);
                setStats(statRes.data);
                setSubjects(subRes.data);
            } else if (user?.role === 'student' || user?.role === 'teacher') {
                const [attnRes, subRes] = await Promise.all([
                    getAttendance(user.email),
                    getSubjects()
                ]);
                setAttendance(attnRes.data || []);
                setSubjects(subRes.data || {});
            }
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const isStaff = ['admin', 'teacher', 'dean'].includes(user?.role);

    return (
        <div className="space-y-8 pb-20 font-sans">
            {/* Unified Enhanced Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-apollo-red border border-red-100 shadow-lg shadow-red-500/10">
                        <GraduationCap size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Welcome, <span className="text-apollo-red">{user?.name}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${user?.role === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                {user?.role} Node
                            </span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${user?.role === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
                                    {user?.role === 'pending' ? 'Identity Verification Active' : `Session Active • ${user?.department || user?.branch || 'General Architecture'}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 flex items-center gap-8 divide-x divide-slate-200 relative z-10">
                    <div className="px-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Reference</p>
                        <p className="text-sm font-black text-slate-800 mt-1 uppercase tracking-tighter">{user?.id || user?.rollNo || 'PENDING'}</p>
                    </div>
                    <div className="px-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Access</p>
                        <p className={`text-sm font-black mt-1 flex items-center gap-2 ${user?.role === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {user?.role === 'pending' ? 'RESTRICTED' : 'GRANTED'} <Zap size={12} fill="currentColor" />
                        </p>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {(loading || actionLoading) && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-apollo-red/30 border-t-apollo-red rounded-full animate-spin shadow-xl"></div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse font-sans">Syncing University Node...</p>
                </div>
            )}

            {!loading && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {user?.role === 'pending' ? (
                        <PendingDashboard user={user} />
                    ) : ['admin', 'coe'].includes(user?.role) ? (
                        <AdminDashboard stats={stats} setActiveTab={setActiveTab} />
                    ) : user?.role === 'teacher' ? (
                        <FacultyDashboard />
                    ) : (
                        <StudentDashboard attendance={attendance} subjects={subjects} user={user} />
                    )}
                </div>
            )}
        </div>
    );
}
