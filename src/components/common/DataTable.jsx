import React from 'react';
import { Download, Search, Filter, MoreHorizontal, FileSpreadsheet, FileJson } from 'lucide-react';

const DataTable = ({ title, data, columns, onExport }) => {
    return (
        <div className="card !p-0 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage and export {title.toLowerCase()} data</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => onExport('csv')} className="btn-pill flex-1 md:flex-none">
                        <FileSpreadsheet size={18} className="text-emerald-600" /> Export CSV
                    </button>
                    <button onClick={() => onExport('pdf')} className="btn-pill flex-1 md:flex-none">
                        <FileJson size={18} className="text-blue-600" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search records..." className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-apollo-red/10" />
                </div>
                <button className="btn-pill px-4 bg-white">
                    <Filter size={16} /> Filter
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">{col.label}</th>
                            ))}
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 text-sm font-semibold text-slate-700">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Showing 1 to {data.length} of {data.length} entries</span>
                <div className="flex gap-1">
                    <button className="p-2 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-not-allowed">1</button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
