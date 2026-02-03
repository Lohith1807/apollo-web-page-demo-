import React from 'react';
import { Clock } from 'lucide-react';

const PendingDashboard = ({ user }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border-2 border-dashed border-red-100 min-h-[450px] shadow-sm animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-apollo-red rounded-full flex items-center justify-center mb-8 relative">
            <Clock size={48} className="animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border-2 border-apollo-red border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter text-center">Application Pending</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center mt-4 font-semibold leading-relaxed">
            Dear <span className="text-slate-800">{user?.name}</span>, your admission request for <span className="text-apollo-red">{user?.department || user?.branch} - {user?.specialization}</span> is in our verification queue.
        </p>
        <div className="mt-10 p-8 bg-slate-50 rounded-[24px] border border-slate-100 w-full max-w-md text-center shadow-inner">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">STATUS: UNDER REVIEW</p>
            </div>
            <p className="text-base font-black text-slate-800">Support Line: <span className="text-apollo-red">+91 99999 99999</span></p>
            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest leading-loose">
                Once accepted, your roll number and section <br /> will be automatically allocated.
            </p>
        </div>
    </div>
);

export default PendingDashboard;
