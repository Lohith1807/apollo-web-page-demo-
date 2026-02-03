import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Zap, Clock, ChevronRight } from 'lucide-react';
import { getResults } from '../../services/api';

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

const StudentDashboard = ({ attendance = [], subjects = {}, user = {} }) => {
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!user?.email) return;
            try {
                const { data } = await getResults(user.email);
                setResults(data || []);
            } catch (err) {
                console.error("Dashboard results fetch error:", err);
            } finally {
                setLoadingResults(false);
            }
        };
        fetchResults();
    }, [user]);

    // Determine the active academic state with deep defaults
    const currentSem = user?.semester || 'Sem 1';
    const currentSection = user?.section || 'Section A';
    const branchKey = user?.branch || user?.department || 'CSE';
    const specKey = user?.specialization || 'Core';

    const attendancePercentage = attendance.length > 0
        ? ((attendance.filter(a => a.status?.toLowerCase() === 'present').length / attendance.length) * 100).toFixed(1) + '%'
        : '0%';

    // CGPA Calculation Logic
    const getGradePoint = (grade) => {
        const points = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'P': 5, 'F': 0 };
        return points[grade] || 0;
    };
    const totalCredits = results.reduce((sum, res) => sum + (res.credits || 3), 0);
    const weightedPoints = results.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

    // Drill down: Branch -> Specialization -> Semester
    const branchData = subjects[branchKey] || {};
    const specData = branchData[specKey] || {};
    const semData = specData[currentSem] || { theory: [], labs: [] };

    // Combine theory and labs for the display list
    const theorySubjects = semData.theory || [];
    const labSubjects = semData.labs || [];
    const allSubjects = [...theorySubjects, ...labSubjects];

    const timeline = theorySubjects.slice(0, 3).map((sub, i) => ({
        time: i === 0 ? '09:00 AM' : (i === 1 ? '11:00 AM' : '02:00 PM'),
        duration: '60m',
        subject: sub,
        room: `Hall ${String.fromCharCode(65 + i)}`,
        current: i === 0
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
                {/* Academic Context Bar */}
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Semester</p>
                            <p className="text-sm font-black text-white">{currentSem}</p>
                        </div>
                        <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Section</p>
                            <p className="text-sm font-black text-white">{currentSection}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Curriculum Path</p>
                        <p className="text-xs font-bold text-apollo-red">{branchKey} • {specKey}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Current CGPA" value={cgpa} icon={Award} color="#e33e33" />
                    <StatCard label="Total Attendance" value={attendancePercentage} icon={CheckCircle2} color="#059669" />
                    <StatCard label="Term Credits" value={theorySubjects.length * 3 + labSubjects.length * 2} icon={Zap} color="#FDB931" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="px-4 border-b border-slate-100">
                            <WidgetHeader title="Recent Activity" action="History" />
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[300px]">
                            {attendance.length > 0 ? attendance.slice(-5).reverse().map((at, idx) => (
                                <div key={idx} className="p-3 border-b border-slate-50 last:border-0 flex justify-between items-center group hover:bg-slate-50 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{at.subject}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{at.date}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${at.status?.toLowerCase() === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {at.status}
                                    </span>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-400 text-xs font-bold">No recent activities found</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 border-b border-slate-100 flex items-center justify-between">
                            <WidgetHeader title="Course Catalog" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{currentSem}</span>
                        </div>
                        <div className="p-1 max-h-[300px] overflow-y-auto">
                            {allSubjects.length > 0 ? allSubjects.map((sub, i) => (
                                <div key={i} className="p-3 hover:bg-slate-50 transition-all rounded-lg group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-apollo-red transition-colors">{sub}</h4>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{i < theorySubjects.length ? 'Theory' : 'Practical / Lab'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-700">{i < theorySubjects.length ? '3' : '2'} Credits</span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-300 group-hover:bg-apollo-red transition-all" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-400 text-xs font-bold">No catalog data for this semester</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 border-b border-white bg-slate-800 text-white">
                        <WidgetHeader title="Daily Schedule" />
                    </div>
                    <div className="p-5 space-y-6">
                        {timeline.length > 0 ? timeline.map((slot, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                {idx !== timeline.length - 1 && <div className="absolute left-1.5 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                                <div className={`w-3 h-3 rounded-full mt-1.5 z-10 transition-all ${slot.current ? 'bg-apollo-red ring-8 ring-red-50 shadow-[0_0_10px_rgba(227,62,51,0.3)]' : 'bg-slate-200'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot.time} • {slot.duration}</p>
                                        {slot.current && <span className="text-[8px] font-black text-white bg-apollo-red px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Now</span>}
                                    </div>
                                    <p className={`text-sm font-bold mt-0.5 ${slot.current ? 'text-slate-900' : 'text-slate-500'}`}>{slot.subject}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{slot.room}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
