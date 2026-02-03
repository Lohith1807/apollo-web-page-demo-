import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Plus, Trash2, Save, GraduationCap, X } from 'lucide-react';
import { getFaculty, getSubjects, updateFaculty } from '../../services/api';

export default function FacultyAllocation() {
    const [faculty, setFaculty] = useState([]);
    const [curriculum, setCurriculum] = useState({});
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newAlloc, setNewAlloc] = useState({
        batch: '2024-2028',
        branch: 'CSE',
        semester: 'Sem 1',
        subject: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [facRes, subRes] = await Promise.all([
                getFaculty(),
                getSubjects()
            ]);
            setFaculty(facRes.data);
            setCurriculum(subRes.data);
        } catch (err) {
            console.error("Failed to load allocation data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFaculty = (fac) => {
        setSelectedFaculty(fac);
        // Reset form
        setNewAlloc({
            batch: '2024-2028',
            branch: 'CSE',
            semester: 'Sem 1',
            subject: ''
        });
    };

    const handleAddAllocation = async () => {
        if (!newAlloc.subject || !selectedFaculty) return;

        // Check if already assigned
        const currentSubjects = selectedFaculty.assignedSubjects || [];
        const exists = currentSubjects.find(s =>
            s.subject === newAlloc.subject &&
            s.batch === newAlloc.batch &&
            s.branch === newAlloc.branch // Maybe semester too
        );

        if (exists) {
            alert('Subject already assigned to this faculty!');
            return;
        }

        const updatedSubjects = [...currentSubjects, { ...newAlloc }];

        try {
            await updateFaculty(selectedFaculty.email, { assignedSubjects: updatedSubjects });
            // Update local state
            const updatedFac = { ...selectedFaculty, assignedSubjects: updatedSubjects };
            setFaculty(faculty.map(f => f.email === selectedFaculty.email ? updatedFac : f));
            setSelectedFaculty(updatedFac);
            alert('Subject assigned successfully!');
        } catch (err) {
            console.error("Failed to assign subject", err);
            alert('Failed to save assignment.');
        }
    };

    const handleRemoveAllocation = async (index) => {
        if (!window.confirm('Are you sure you want to remove this assignment?')) return;

        const updatedSubjects = selectedFaculty.assignedSubjects.filter((_, i) => i !== index);
        try {
            await updateFaculty(selectedFaculty.email, { assignedSubjects: updatedSubjects });
            // Update local state
            const updatedFac = { ...selectedFaculty, assignedSubjects: updatedSubjects };
            setFaculty(faculty.map(f => f.email === selectedFaculty.email ? updatedFac : f));
            setSelectedFaculty(updatedFac);
        } catch (err) {
            alert('Failed to remove assignment.');
        }
    };

    // Helper to get subjects based on selection
    const availableSubjects = () => {
        if (!curriculum[newAlloc.branch]) return [];
        // Default to first calc spec if not explicitly handled in simpler form
        // For simplicity, let's assume 'Core' specialization for dropdown or merge all
        // The curriculum structure is Branch -> Specialization -> Semester -> { theory: [], labs: [] }

        // We need simplify selection for now, maybe just flattened list or require user to pick spec?
        // Let's iterate all specs for the selected branch/sem to find subjects
        const specs = curriculum[newAlloc.branch];
        let subs = [];
        Object.values(specs).forEach(specData => {
            if (specData[newAlloc.semester]) {
                if (specData[newAlloc.semester].theory) subs.push(...specData[newAlloc.semester].theory);
                if (specData[newAlloc.semester].labs) subs.push(...specData[newAlloc.semester].labs);
            }
        });
        return [...new Set(subs)]; // Unique
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-500">
            {/* Left Sidebar: Faculty List */}
            <div className="w-1/3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Faculty Directory</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{faculty.length} Teachers Registered</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-slate-400">Loading directory...</div>
                    ) : (
                        faculty.map(fac => (
                            <button
                                key={fac.email}
                                onClick={() => handleSelectFaculty(fac)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedFaculty?.email === fac.email
                                        ? 'bg-apollo-red text-white shadow-md shadow-red-500/20'
                                        : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedFaculty?.email === fac.email ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {fac.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold truncate">{fac.name}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${selectedFaculty?.email === fac.email ? 'text-white/70' : 'text-slate-400'
                                        }`}>{fac.department || 'General'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Allocation */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {selectedFaculty ? (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{selectedFaculty.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Subject Allocations • {selectedFaculty.assignedSubjects?.length || 0} Active
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                                Active Faculty
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">
                            {/* Add New Allocation */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Plus size={14} className="text-apollo-red" /> Assign New Subject
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Batch</label>
                                            <select
                                                value={newAlloc.batch}
                                                onChange={e => setNewAlloc({ ...newAlloc, batch: e.target.value })}
                                                className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-apollo-red"
                                            >
                                                <option>2024-2028</option>
                                                <option>2023-2027</option>
                                                <option>2022-2026</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Branch</label>
                                            <select
                                                value={newAlloc.branch}
                                                onChange={e => setNewAlloc({ ...newAlloc, branch: e.target.value })}
                                                className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-apollo-red"
                                            >
                                                {Object.keys(curriculum).map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Semester</label>
                                            <select
                                                value={newAlloc.semester}
                                                onChange={e => setNewAlloc({ ...newAlloc, semester: e.target.value })}
                                                className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-apollo-red"
                                            >
                                                {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                                            <select
                                                value={newAlloc.subject}
                                                onChange={e => setNewAlloc({ ...newAlloc, subject: e.target.value })}
                                                className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-apollo-red"
                                            >
                                                <option value="">Select Subject</option>
                                                {availableSubjects().map((sub, i) => (
                                                    <option key={i} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleAddAllocation}
                                            disabled={!newAlloc.subject}
                                            className="w-full py-2.5 mt-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Assign Subject
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Existing Allocations */}
                            <div className="lg:col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Workload</h4>
                                {(!selectedFaculty.assignedSubjects || selectedFaculty.assignedSubjects.length === 0) ? (
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                        <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
                                        <p className="text-xs font-bold text-slate-400">No subjects assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedFaculty.assignedSubjects.map((sub, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-apollo-red/30 transition-all group relative">
                                                <button
                                                    onClick={() => handleRemoveAllocation(idx)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.batch} • {sub.semester}</p>
                                                <h5 className="text-xs font-black text-slate-800 mb-1">{sub.subject}</h5>
                                                <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-bold text-slate-500">{sub.branch}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Users size={48} className="mb-4 text-slate-200" />
                        <p className="text-xs font-bold uppercase tracking-widest">Select a faculty member to manage workload</p>
                    </div>
                )}
            </div>
        </div>
    );
}
