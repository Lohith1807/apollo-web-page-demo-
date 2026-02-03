import React from 'react';
import { BookOpen, CheckCircle2, Bell, TrendingUp, ChevronRight, Clock, Users, GraduationCap, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all group">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-6 shadow-sm`} style={{ backgroundColor: color }}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</p>
            <h3 className="text-xl font-black text-slate-900 leading-none mt-1">{value}</h3>
        </div>
    </div>
);

const WidgetHeader = ({ title, icon: Icon, action }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-apollo-red" />}
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h3>
        </div>
        {action && (
            <button className="text-[10px] font-black text-slate-400 hover:text-apollo-red transition-colors flex items-center gap-1 uppercase tracking-widest">
                {action} <ChevronRight size={12} />
            </button>
        )}
    </div>
);

const FacultyDashboard = () => {
    const { user } = useAuth();
    const assigned = user?.assignedSubjects || [];
    const [stats, setStats] = React.useState({
        totalStudents: 0,
        activeClasses: assigned.length,
        hoursLogged: 24, // Keep mock or calc from timetable if available
        avgAttendance: 0,
        creditsTaught: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            if (assigned.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // 1. Get all students to count total students taught
                // We need to fetch students matching the batch/branch/sem of assigned subjects
                const { data: allStudents } = await import('../../services/api').then(m => m.getStudents());

                // Identify unique students in assigned classes
                const uniqueEmails = new Set();
                let totalCredits = 0;

                assigned.forEach(sub => {
                    const classStudents = allStudents.filter(s =>
                        s.batch === sub.batch &&
                        s.branch === sub.branch &&
                        s.semester === sub.semester
                    );
                    classStudents.forEach(s => uniqueEmails.add(s.email));

                    // Assume 3 credits per subject if not specified
                    totalCredits += (sub.credits || 3);
                });

                // 2. Calculate Live Attendance (Today's % across all classes)
                // This is heavy, let's just do it for the FIRST subject for demo efficiency or just randomise slightly based on real data if possible?
                // Better: Fetch today's batch attendance for all subjects
                const today = new Date().toISOString().split('T')[0];
                let totalPresent = 0;
                let totalMarked = 0;

                // We'll try to fetch for all assigned subjects
                await Promise.all(assigned.map(async (sub) => {
                    // We need a way to check attendance without fetching full student profiles again if possible
                    // functionality exists in getBatchAttendance
                    const classStudents = allStudents.filter(s =>
                        s.batch === sub.batch &&
                        s.branch === sub.branch &&
                        s.semester === sub.semester
                    );
                    if (classStudents.length === 0) return;

                    const emails = classStudents.map(s => s.email);
                    const { data: attendanceData } = await import('../../services/api').then(m => m.getBatchAttendance({
                        date: today,
                        subject: sub.subject,
                        students: emails
                    }));

                    // Count
                    Object.values(attendanceData).forEach(status => {
                        if (status !== 'Not Marked') {
                            totalMarked++;
                            if (status === 'Present') totalPresent++;
                        }
                    });
                }));

                const avgAtt = totalMarked > 0 ? ((totalPresent / totalMarked) * 100).toFixed(1) : 0;

                setStats(prev => ({
                    ...prev,
                    totalStudents: uniqueEmails.size,
                    avgAttendance: avgAtt,
                    creditsTaught: totalCredits
                }));

            } catch (err) {
                console.error("Failed to load faculty stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [assigned]);

    // Generate timeline from assigned subjects (Mocking time slots for demo)
    const timeline = assigned.slice(0, 4).map((sub, i) => ({
        time: i === 0 ? '09:00 AM' : (i === 1 ? '11:00 AM' : '02:00 PM'),
        duration: '60m',
        subject: sub.subject,
        room: `Hall ${String.fromCharCode(65 + i)}`,
        batch: `${sub.branch || 'CSE'} • ${sub.semester || 'Sem 1'}`,
        current: i === 0
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
                {/* Faculty Context Bar */}
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight">{user.name}</h2>
                            <div className="flex gap-3 mt-1">
                                <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                    Assistant Professor
                                </div>
                                <div className="px-2 py-0.5 bg-apollo-red/80 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                    {user.department || 'CSE'} Department
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Employee ID</p>
                        <p className="text-xs font-bold text-apollo-red">{user.id || 'FAC-001'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Total Students" value={loading ? '...' : stats.totalStudents} icon={Users} color="#2563eb" />
                    <StatCard label="Live Attendance" value={loading ? '...' : `${stats.avgAttendance}%`} icon={CheckCircle2} color="#059669" />
                    <StatCard label="Credits Earned" value={loading ? '...' : stats.creditsTaught} icon={Zap} color="#FDB931" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance / Tasks List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="px-4 border-b border-slate-100">
                            <WidgetHeader title="Pending Actions" action="View All" />
                        </div>
                        <div className="flex-1 p-4 space-y-3">
                            {[
                                { task: "Upload Marks for Mid-Term", due: "Today", urgent: true },
                                { task: "Approve Leave Requests", due: "Tomorrow", urgent: false },
                                { task: "Submit Lesson Plan", due: "Fri, 12th", urgent: false }
                            ].map((task, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-apollo-red animate-pulse' : 'bg-slate-300'}`}></div>
                                        <span className="text-xs font-bold text-slate-700">{task.task}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.due}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class Registry */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 border-b border-slate-100 flex items-center justify-between">
                            <WidgetHeader title="Class Registry" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Current Term</span>
                        </div>
                        <div className="p-1 max-h-[300px] overflow-y-auto">
                            {assigned.length > 0 ? assigned.map((sub, i) => (
                                <div key={i} className="p-3 hover:bg-slate-50 transition-all rounded-lg group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-apollo-red transition-colors">{sub.subject}</h4>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{sub.branch} • {sub.semester}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-700">{sub.batch}</span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-300 group-hover:bg-apollo-red transition-all" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-400 text-xs font-bold">No assigned classes</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 border-b border-white bg-indigo-900 text-white">
                        <WidgetHeader title="Teaching Schedule" />
                    </div>
                    <div className="p-5 space-y-6">
                        {timeline.length > 0 ? timeline.map((slot, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                {idx !== timeline.length - 1 && <div className="absolute left-1.5 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                                <div className={`w-3 h-3 rounded-full mt-1.5 z-10 transition-all ${slot.current ? 'bg-apollo-red ring-8 ring-indigo-50 shadow-[0_0_10px_rgba(227,62,51,0.3)]' : 'bg-slate-200'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot.time} • {slot.duration}</p>
                                        {slot.current && <span className="text-[8px] font-black text-white bg-apollo-red px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Live</span>}
                                    </div>
                                    <p className={`text-sm font-bold mt-0.5 ${slot.current ? 'text-slate-900' : 'text-slate-500'}`}>{slot.subject}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{slot.room} • <span className="text-indigo-600">{slot.batch}</span></p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={100} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight relative z-10">Department Notice</h3>
                    <p className="text-xs font-medium opacity-90 mt-2 relative z-10 leading-relaxed">
                        Faculty meeting scheduled for Friday at 3:00 PM in the Conference Hall. Please bring updated course files.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-white text-indigo-900 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-indigo-50 transition-colors relative z-10">
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
