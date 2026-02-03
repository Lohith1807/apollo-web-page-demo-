import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSubjects, getAttendance } from '../../services/api';
import {
    Book, FileText, Video, Clipboard,
    MoreVertical, Download, ExternalLink,
    MessageSquare, Calendar, ChevronRight,
    Clock, Plus, Bookmark, Filter, ArrowLeft
} from 'lucide-react';

const ClassroomCube = ({ course, onClick, isStaff }) => (
    <button
        onClick={onClick}
        className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden text-left transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex flex-col h-56 shadow-sm"
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${course.color || 'bg-apollo-red'} group-hover:w-2 transition-all`}></div>

        <div className="p-6 flex flex-col h-full w-full">
            <div className="flex justify-between items-start mb-3">
                <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {course.code || 'CODE'}
                </div>
                <div className="flex gap-2">
                    <Bookmark size={14} className="text-slate-300 hover:text-apollo-red cursor-pointer" />
                    <MoreVertical size={14} className="text-slate-300" />
                </div>
            </div>

            <h4 className="text-base font-black text-slate-800 leading-tight group-hover:text-apollo-red transition-colors line-clamp-2">
                {course.name}
            </h4>

            <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">
                    <Video size={10} /> Live Class
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase">
                    <FileText size={10} /> 12 Materials
                </span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${course.id + i}`} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400">
                        +12
                    </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-apollo-red transition-all group-hover:translate-x-1" />
            </div>
        </div>
    </button>
);

const MaterialRow = ({ title, type, size, date }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${type === 'PDF' ? 'bg-red-50 text-red-500' :
                type === 'PPT' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                }`}>
                <FileText size={20} />
            </div>
            <div>
                <h5 className="text-sm font-bold text-slate-700 group-hover:text-apollo-red transition-colors">{title}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{type} • {size} • Uploaded {date}</p>
            </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-apollo-red hover:bg-slate-50 rounded-lg transition-all">
            <Download size={18} />
        </button>
    </div>
);

const AssignmentCard = ({ title, deadline, status }) => (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 hover:border-apollo-red/30 transition-all shadow-sm">
        <div className="flex justify-between items-start">
            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                {status}
            </div>
            <Clock size={14} className="text-slate-300" />
        </div>
        <div>
            <h5 className="text-sm font-black text-slate-800 line-clamp-1">{title}</h5>
            <div className="flex items-center gap-2 mt-2">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400">Due: {deadline}</span>
            </div>
        </div>
        <button className="w-full py-2 bg-slate-100 hover:bg-apollo-red hover:text-white transition-all rounded-lg text-[10px] font-black uppercase tracking-widest">
            Open Assignment
        </button>
    </div>
);

export default function Classroom() {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [subjects, setSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const isStaff = ['admin', 'teacher', 'dean'].includes(user?.role);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await getSubjects();
                setSubjects(data || {});
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    // Robust course derivation
    useEffect(() => {
        if (!loading && user?.role === 'teacher') {
            // For teachers, we don't derive from "currentSem" property on user
            // Instead we check assignedSubjects
        }
    }, [loading, user]);

    let rawSubjects = [];

    if (user?.role === 'teacher') {
        const assigned = user.assignedSubjects || [];
        // Map assigned subjects to simple string names or objects
        rawSubjects = assigned.map(s => s.subject);
    } else {
        const currentSem = user?.semester || 'Sem 1';
        const branchKey = user?.branch || user?.department || 'CSE';
        const specKey = user?.specialization || 'Core';

        const branchData = subjects[branchKey] || {};
        const specData = branchData[specKey] || {};
        const semData = specData[currentSem] || { theory: [], labs: [] };

        const theorySubjects = semData.theory || [];
        const labSubjects = semData.labs || [];
        rawSubjects = [...theorySubjects, ...labSubjects];
    }

    const colors = ['bg-apollo-red', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const courses = rawSubjects.map((name, i) => ({
        id: i,
        name: typeof name === 'string' ? name : (name.name || 'Subject'),
        code: `SUB${100 + i}`, // Simplified code generation
        color: colors[i % colors.length]
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
            </div>
        );
    }

    if (selectedCourse) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedCourse(null)}
                        className="flex items-center gap-2 text-slate-500 hover:text-apollo-red font-bold text-sm transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Classroom
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20">
                            <Video size={16} /> Join Live Session
                        </button>
                        {isStaff && (
                            <button className="px-4 py-2 bg-apollo-red text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20">
                                <Plus size={16} /> Upload Material
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCourse.name}</h1>
                    <div className="flex gap-4 mt-4">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-widest">{selectedCourse.code}</span>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-widest">Active Term</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Materials & Discussion */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Discussion / Announcements */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Class Interaction</h3>
                                <MessageSquare size={16} className="text-slate-300" />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-apollo-red flex items-center justify-center text-white font-black text-xs">TEA</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h6 className="text-[11px] font-black text-slate-700 uppercase">Dr. Smith • Instructor</h6>
                                            <span className="text-[9px] font-bold text-slate-400">2h ago</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 mt-1">
                                            The lecture notes for this course are now uploaded. Please review them before the next session.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input type="text" placeholder="Post a comment or question..." className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-apollo-red outline-none transition-all" />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-apollo-red font-black text-[10px] uppercase tracking-widest hover:scale-110 transition-transform">Send</button>
                                </div>
                            </div>
                        </div>

                        {/* Materials Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Lecture Materials</h3>
                                <button className="text-[10px] font-black text-apollo-red uppercase">View All</button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <MaterialRow title="Unit 1 - Introduction" type="PDF" size="4.2 MB" date="29 Jan 2026" />
                                <MaterialRow title="Course Syllabus & Guidelines" type="PPT" size="12.5 MB" date="25 Jan 2026" />
                                <MaterialRow title="Reference Documentation" type="DOCX" size="1.8 MB" date="22 Jan 2026" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Assignments & Schedule */}
                    <div className="space-y-8">
                        {/* Assignments */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Upcoming Assignments</h3>
                            <AssignmentCard title="First Term Paper" deadline="Tomorrow, 11:59 PM" status="Pending" />
                            <AssignmentCard title="Self Assessment" deadline="Feb 05, 05:00 PM" status="Submitted" />
                        </div>

                        {/* Mini Timetable */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Class Schedule</h3>
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="text-center">
                                            <p className="text-xs font-black text-apollo-red">MON</p>
                                            <p className="text-[9px] font-bold opacity-40">JAN 29</p>
                                        </div>
                                        <div className="flex-1 border-l border-white/10 pl-4 py-1">
                                            <h6 className="text-[11px] font-black uppercase">Lecture Session</h6>
                                            <p className="text-[10px] opacity-60 mt-0.5">09:00 AM - 10:30 AM • Hall B</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="text-center">
                                            <p className="text-xs font-black text-blue-400">WED</p>
                                            <p className="text-[9px] font-bold opacity-40">JAN 31</p>
                                        </div>
                                        <div className="flex-1 border-l border-white/10 pl-4 py-1">
                                            <h6 className="text-[11px] font-black uppercase">Practical Lab</h6>
                                            <p className="text-[10px] opacity-60 mt-0.5">02:00 PM - 05:00 PM • Lab 2</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-apollo-red/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Digital Classroom</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Knowledge Hub • Welcome, {user?.name}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={18} />
                    </button>
                    <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-apollo-red text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all">
                        Refresh Hub
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Access Your Virtual Learning Hub</h2>
                    <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                        Join live sessions, download course materials, and submit assignments directly through your digital classroom. Interactive learning starts here.
                    </p>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4 opacity-40">
                    <Book size={80} className="rotate-12" />
                    <Video size={60} className="-rotate-12 translate-y-8" />
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-apollo-red/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? courses.map(course => (
                    <ClassroomCube
                        key={course.id}
                        course={course}
                        onClick={() => setSelectedCourse(course)}
                        isStaff={isStaff}
                    />
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Book size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active courses in your track</p>
                    </div>
                )}
            </div>
        </div>
    );
}
