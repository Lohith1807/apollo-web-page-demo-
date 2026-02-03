import React from 'react';
import { Users, BookOpen, Bell, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const AdminDashboard = ({ stats, setActiveTab }) => {
    const steps = [
        {
            id: 'directory',
            name: 'Registry Node',
            label: 'Total Students',
            value: stats?.totalStudents || "0",
            icon: Users,
            color: 'bg-blue-600',
            desc: 'Database of all active and alumni students.'
        },
        {
            id: 'directory',
            name: 'Faculty Hub',
            label: 'Total Faculty',
            value: stats?.totalFaculty || "0",
            icon: BookOpen,
            color: 'bg-emerald-600',
            desc: 'Teaching and non-teaching staff registry.'
        },
        {
            id: 'classroom',
            name: 'Admission Pipeline',
            label: 'Live Applications',
            value: stats?.pendingApplications || "0",
            icon: Bell,
            color: 'bg-red-600',
            desc: 'New registration requests awaiting verification.'
        },
        {
            id: 'curriculum',
            name: 'Syllabus Mapping',
            label: 'Course Catalog',
            value: 'Verified',
            icon: Zap,
            color: 'bg-amber-500',
            desc: 'Global curriculum and subject tracking system.'
        },
        {
            id: 'attendance',
            name: 'Monitoring Node',
            label: 'Attendance Override',
            value: 'Active',
            icon: TrendingUp,
            color: 'bg-indigo-600',
            desc: 'Real-time student search and log modification.'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Management Pipeline</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Institutional Operations Node • Step-by-Step Monitoring</p>
            </div>

            <div className="relative space-y-4">
                <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-100 -z-10"></div>

                {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-8 group">
                        <div className={`w-20 h-20 rounded-[24px] ${step.color} flex flex-col items-center justify-center text-white shadow-xl shadow-current group-hover:scale-110 transition-transform flex-shrink-0 cursor-pointer`} onClick={() => setActiveTab(step.id)}>
                            <step.icon size={24} />
                            <span className="text-[8px] font-black uppercase mt-1">Step 0{idx + 1}</span>
                        </div>

                        <div className="flex-1 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{step.name}</h3>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                    <span className="text-[10px] font-black text-apollo-red uppercase tracking-widest">{step.label}</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{step.value}</h2>
                                <p className="text-xs font-bold text-slate-500">{step.desc}</p>
                            </div>

                            <button
                                onClick={() => setActiveTab(step.id)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group/btn"
                            >
                                Manage Node <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global System Health</h4>
                        <div className="flex items-center gap-4 mt-2">
                            <h2 className="text-4xl font-black tracking-tight">{stats?.systemHealth || "Optimal"}</h2>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">Stable Node</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <Zap size={64} className="text-slate-800" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
