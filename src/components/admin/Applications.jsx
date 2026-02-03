import React, { useState, useEffect } from 'react';
import {
    Users, Mail, CheckCircle2, ChevronDown, ChevronRight, Search
} from 'lucide-react';
import { getPendingRegistrations, approveRegistration, rejectRegistration } from '../../services/api';

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDepts, setExpandedDepts] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await getPendingRegistrations();
            setApplications(data);
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (email) => {
        try {
            await approveRegistration(email);
            fetchData();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleReject = async (email) => {
        try {
            await rejectRegistration(email);
            fetchData();
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const toggleDept = (dept) => {
        setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
    };

    const grouped = applications.reduce((acc, app) => {
        const dept = app.branch || 'Other';
        const spec = app.specialization || 'General';
        if (!acc[dept]) acc[dept] = {};
        if (!acc[dept][spec]) acc[dept][spec] = [];
        acc[dept][spec].push(app);
        return acc;
    }, {});

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Registrations</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Access Control Hub • Pending Approval Queue</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4">
                    {Object.keys(grouped).length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Users size={48} className="opacity-20 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Inbox Zero • No Pending Tasks</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([dept, specializations]) => (
                                <div key={dept} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => toggleDept(dept)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-red-50 text-apollo-red rounded-xl flex items-center justify-center font-black">
                                                {dept[0]}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{dept} Department</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{Object.values(specializations).flat().length} Applications</p>
                                            </div>
                                        </div>
                                        {expandedDepts[dept] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                    </button>

                                    {expandedDepts[dept] && (
                                        <div className="bg-slate-50/30 p-4 space-y-4">
                                            {Object.entries(specializations).map(([spec, studentList]) => (
                                                <div key={spec} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                                    <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Track: {spec}</span>
                                                    </div>
                                                    <div className="divide-y divide-slate-50">
                                                        {studentList.map((app) => (
                                                            <div key={app.email} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 uppercase font-black text-xs">
                                                                        {app.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="text-sm font-black text-slate-800">{app.name}</h5>
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                                            <Mail size={10} /> {app.email} • {app.batch}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleApprove(app.email)}
                                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <CheckCircle2 size={12} /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(app.email)}
                                                                        className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
