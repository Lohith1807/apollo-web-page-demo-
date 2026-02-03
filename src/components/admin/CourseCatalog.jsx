import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Plus, Trash2, Save, ChevronRight, ChevronDown, FlaskConical, LayoutGrid } from 'lucide-react';
import { getSubjects, updateSubjects } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CourseCatalog() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedDept, setExpandedDept] = useState(null);
    const [expandedSpec, setExpandedSpec] = useState(null);
    const [expandedSem, setExpandedSem] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const { data } = await getSubjects();
            setSubjects(data);
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSubjects(subjects);
            setIsEditing(false);
            alert('Curriculum updated successfully!');
        } catch (err) {
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const addSubject = (dept, spec, sem, type) => {
        const name = prompt(`Enter new ${type} name:`);
        if (!name) return;

        const newSubjects = { ...subjects };
        if (!newSubjects[dept][spec][sem][type]) {
            newSubjects[dept][spec][sem][type] = [];
        }
        newSubjects[dept][spec][sem][type].push(name);
        setSubjects(newSubjects);
    };

    const removeSubject = (dept, spec, sem, type, index) => {
        if (!window.confirm('Remove this item?')) return;
        const newSubjects = { ...subjects };
        newSubjects[dept][spec][sem][type].splice(index, 1);
        setSubjects(newSubjects);
    };

    // Filter subjects for students
    const displayedSubjects = React.useMemo(() => {
        if (!user || user.role !== 'student') return subjects;

        const dept = user.branch || user.department;
        const spec = user.specialization;

        if (!dept || !subjects[dept]) return {};

        // If user has a specialization, show only that key.
        // If spec is not found (or undefined), we might just show the whole department? 
        // User requested "only his course related information". 
        // Assuming if spec exists in data, we filter by it.

        if (spec && subjects[dept][spec]) {
            return {
                [dept]: {
                    [spec]: subjects[dept][spec]
                }
            };
        }

        // Fallback: show only the user's department
        return { [dept]: subjects[dept] };
    }, [subjects, user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Curriculum Master</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Global Syllabus Repository • Semester Mapping</p>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'admin' && (isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); fetchSubjects(); }}
                                className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel Changes
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                {saving ? 'Saving...' : <><Save size={16} /> Save Curriculum</>}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} className="text-apollo-red" /> Edit Catalog
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {Object.keys(displayedSubjects).length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No curriculum data found for your specialization</p>
                    </div>
                ) : Object.entries(displayedSubjects).map(([dept, specs]) => (
                    <div key={dept} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <button
                            onClick={() => setExpandedDept(expandedDept === dept ? null : dept)}
                            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-apollo-red rounded-2xl flex items-center justify-center">
                                    <BookOpen size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{dept} Department</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Object.keys(specs).length} Specializations Mapping</p>
                                </div>
                            </div>
                            {expandedDept === dept ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                        </button>

                        {expandedDept === dept && (
                            <div className="p-8 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {Object.entries(specs).map(([spec, sems]) => (
                                    <div key={spec} className="border border-slate-100 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedSpec(expandedSpec === spec ? null : spec)}
                                            className="w-full px-6 py-4 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                                        >
                                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">{spec} TRACK</h4>
                                            {expandedSpec === spec ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                        </button>

                                        {expandedSpec === spec && (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {Object.entries(sems).map(([sem, counts]) => (
                                                    <div key={sem} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group hover:border-apollo-red transition-all">
                                                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{sem}</h5>
                                                            <span className="text-[9px] font-black text-apollo-red bg-red-50 px-2 py-0.5 rounded-full">8 ITEMS</span>
                                                        </div>

                                                        {/* Theory Subjects */}
                                                        <div className="space-y-1.5 mb-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <LayoutGrid size={10} /> Theory
                                                                </p>
                                                                {isEditing && (
                                                                    <button onClick={() => addSubject(dept, spec, sem, 'theory')} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-md">
                                                                        <Plus size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {counts.theory?.map((sub, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between group/item">
                                                                        <p className="text-[10px] font-bold text-slate-600 truncate flex-1">{sub}</p>
                                                                        {isEditing && (
                                                                            <button onClick={() => removeSubject(dept, spec, sem, 'theory', idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                <Trash2 size={10} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Labs */}
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <FlaskConical size={10} /> Labs
                                                                </p>
                                                                {isEditing && (
                                                                    <button onClick={() => addSubject(dept, spec, sem, 'labs')} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-md">
                                                                        <Plus size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {counts.labs?.map((lab, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between group/item">
                                                                        <p className="text-[10px] font-bold text-slate-600 truncate flex-1">{lab}</p>
                                                                        {isEditing && (
                                                                            <button onClick={() => removeSubject(dept, spec, sem, 'labs', idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                <Trash2 size={10} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
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
                ))}
            </div>
        </div>
    );
}
