import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getResults } from '../../services/api';
import { Award, BarChart3, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

const ResultRow = ({ course, code, internal, external, total, grade }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 items-center p-5 hover:bg-slate-50 transition-all border-b border-slate-50 group animation-fade-in-up">
        <div className="md:col-span-6 mb-2 md:mb-0">
            <h6 className="text-sm font-black text-slate-800">{course}</h6>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{code}</span>
        </div>
        <div className="md:col-span-2 text-center text-xs font-bold text-slate-500 mb-1 md:mb-0">
            <span className="md:hidden text-[9px] uppercase tracking-widest mr-2">Internal:</span>
            {internal}
        </div>
        <div className="md:col-span-2 text-center text-xs font-bold text-slate-500 mb-1 md:mb-0">
            <span className="md:hidden text-[9px] uppercase tracking-widest mr-2">External:</span>
            {external}
        </div>
        <div className="md:col-span-2 flex flex-col items-center">
            <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${grade === 'A+' ? 'bg-emerald-100 text-emerald-600' :
                grade === 'A' ? 'bg-blue-100 text-blue-600' :
                    grade === 'F' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-500'
                }`}>{grade} Grade</span>
            <span className="text-[9px] font-bold text-slate-400 mt-1">{total}/100</span>
        </div>
    </div>
);

export default function Results() {
    const { user } = useAuth();
    const [groupedResults, setGroupedResults] = useState({});
    const [selectedSem, setSelectedSem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!user?.email) return;
            try {
                const { data } = await getResults(user.email, user.role, user.batch);
                // Group by semester
                const grouped = {};
                data.forEach(res => {
                    const sem = res.semester || 'Unknown Sem';
                    if (!grouped[sem]) grouped[sem] = [];
                    grouped[sem].push(res);
                });

                // Sort semesters (Sem 1, Sem 2...)
                const sortedKeys = Object.keys(grouped).sort((a, b) => {
                    const numA = parseInt(a.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });

                const sortedGrouped = {};
                sortedKeys.forEach(key => sortedGrouped[key] = grouped[key]);

                setGroupedResults(sortedGrouped);
                if (sortedKeys.length > 0) setSelectedSem(sortedKeys[sortedKeys.length - 1]); // Default to latest
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [user]);

    // CGPA Calculation (Overall)
    const getGradePoint = (grade) => {
        const points = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'P': 5, 'F': 0 };
        return points[grade] || 0;
    };

    const allResults = Object.values(groupedResults).flat();
    const totalCredits = allResults.reduce((sum, res) => sum + (res.credits || 3), 0);
    const weightedPoints = allResults.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

    // SGPA Calculation for Selected Sem
    const currentSemResults = groupedResults[selectedSem] || [];
    const semCredits = currentSemResults.reduce((sum, res) => sum + (res.credits || 3), 0);
    const semWeightedPoints = currentSemResults.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
    const sgpa = semCredits > 0 ? (semWeightedPoints / semCredits).toFixed(2) : '0.00';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Academic Results</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Examination Report • {selectedSem || 'Overview'}</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cumulative GPA</p>
                        <p className="text-xl font-black text-apollo-red">{cgpa}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-apollo-red">
                        <Award size={20} />
                    </div>
                </div>
            </div>

            {Object.keys(groupedResults).length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Results Published Yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Semester Tabs */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {Object.keys(groupedResults).map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setSelectedSem(sem)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedSem === sem
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                >
                                    {sem} Result
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">{selectedSem} Scorecard</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SGPA: <span className="text-emerald-500">{sgpa}</span></p>
                                </div>
                                <button className="text-[10px] font-black text-apollo-red uppercase tracking-widest hover:underline flex items-center gap-1">
                                    <FileText size={12} /> Download PDF
                                </button>
                            </div>
                            <div className="hidden md:grid grid-cols-12 p-4 bg-slate-100/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <div className="col-span-6 px-4">Subject Information</div>
                                <div className="col-span-2 text-center">Internal (40)</div>
                                <div className="col-span-2 text-center">External (60)</div>
                                <div className="col-span-2 text-center">Final Grade</div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {currentSemResults.map((res, i) => (
                                    <ResultRow key={i} {...res} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sidebar Analysis - Kept Static for Demo or could be dynamic */}
                        <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Performance Analysis</p>
                                <h3 className="text-3xl font-black mb-1">Excellent</h3>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                                    You are performing consistent in {selectedSem}. Keep up the momentum for upcoming semesters.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${(parseFloat(sgpa) / 10) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black text-emerald-500">{sgpa}</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-apollo-red opacity-20 blur-3xl rounded-full"></div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingUp size={14} className="text-emerald-500" /> Grade Trends
                            </h4>
                            <div className="space-y-3">
                                {Object.keys(groupedResults).map(sem => {
                                    // Calc SGPA for this sem locally
                                    const sRes = groupedResults[sem];
                                    const sCred = sRes.reduce((sum, res) => sum + (res.credits || 3), 0);
                                    const sPts = sRes.reduce((sum, res) => sum + (getGradePoint(res.grade) * (res.credits || 3)), 0);
                                    const sSgpa = sCred > 0 ? (sPts / sCred).toFixed(2) : '0.00';

                                    return (
                                        <div key={sem}>
                                            <div className="flex justify-between items-center text-xs pt-2">
                                                <span className="font-bold text-slate-500">{sem}</span>
                                                <span className="font-black text-slate-900">{sSgpa} SGPA</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                                                <div className="h-full bg-emerald-500" style={{ width: `${(parseFloat(sSgpa) / 10) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
