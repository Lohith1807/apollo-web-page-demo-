import React, { useState, useEffect } from 'react';
import { Users, Search, BookOpen, ChevronRight, Mail, Edit2, X, Save, Phone, MapPin, Calendar, User, Plus } from 'lucide-react';
import { getStudents, getFaculty, updateStudent, createFaculty } from '../../services/api';

const EditUserModal = ({ user, type, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.personalInfo?.phone || user.phone || '',
        address: user.personalInfo?.address || user.address || '',
        dob: user.personalInfo?.dob || user.dob || '',
        gender: user.personalInfo?.gender || user.gender || '',
        branch: user.branch || user.department || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // For students we might need to nest personalInfo back
            const payload = type === 'students' ? {
                name: formData.name,
                email: formData.email,
                branch: formData.branch,
                personalInfo: {
                    phone: formData.phone,
                    address: formData.address,
                    dob: formData.dob,
                    gender: formData.gender
                }
            } : formData;

            await updateStudent(user.email, payload);
            alert('User updated successfully');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Edit {type === 'students' ? 'Student' : 'Faculty'} Profile</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Override • {user.rollNo || user.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-apollo-red transition-all"><X size={20} /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Email</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20 cursor-not-allowed opacity-60"
                                    value={formData.email}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch / Dept</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Discard</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-apollo-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                        Sync Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddFacultyModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'Test@123', // Default initial password
        department: '',
        id: ''
    });
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFaculty(formData);
            alert('Faculty created successfully');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Onboard New Faculty</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Create Teaching Credentials</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-apollo-red transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleCreate} className="p-8 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                            placeholder="Dr. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                            placeholder="faculty@apollo.edu"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                        <input
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                        <select
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-apollo-red/20"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="ME">Mechanical</option>
                            <option value="CE">Civil</option>
                            <option value="Humanities">Humanities</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-apollo-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Plus size={14} />}
                        Create Credentials
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function GlobalDirectory() {
    const [directory, setDirectory] = useState({ students: [], faculty: [] });
    const [dirType, setDirType] = useState('students');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stdRes, facRes] = await Promise.all([getStudents(), getFaculty()]);
            setDirectory({ students: stdRes.data, faculty: facRes.data });
        } catch (err) {
            console.error('Directory failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredDir = (dirType === 'students' ? directory.students : directory.faculty).filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.rollNo?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-apollo-red rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Global Directory</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Entity Mapping • Central Node Registry</p>
                </div>
                {dirType === 'faculty' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 hover:bg-apollo-red text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New Faculty
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex p-1 bg-slate-200 rounded-xl w-fit">
                        <button
                            onClick={() => setDirType('students')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dirType === 'students' ? 'bg-white text-apollo-red shadow-sm' : 'text-slate-500'}`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setDirType('faculty')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dirType === 'faculty' ? 'bg-white text-apollo-red shadow-sm' : 'text-slate-500'}`}
                        >
                            Faculty
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Flash query..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none ring-2 ring-transparent focus:ring-apollo-red/20 transition-all w-64 shadow-inner"
                        />
                    </div>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-left border-b border-slate-100">
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Roll</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDir.map(u => (
                                <tr key={u.email} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-apollo-red group-hover:text-white transition-all uppercase">
                                                {u.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{u.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-xs font-bold text-slate-600 font-mono">{u.rollNo || u.id || 'N/A'}</td>
                                    <td className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.branch || u.department || 'GENERAL'}</td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => setEditingUser(u)}
                                            className="px-4 py-1.5 bg-slate-100 text-slate-400 hover:text-apollo-red hover:bg-red-50 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 ml-auto"
                                        >
                                            <Edit2 size={12} /> Edit Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    type={dirType}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        fetchData();
                    }}
                />
            )}

            {showAddModal && (
                <AddFacultyModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
