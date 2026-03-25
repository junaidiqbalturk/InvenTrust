import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function InvoicesIndex({ auth, invoices }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Fiscal Records
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Transaction History & Verification</p>
                    </div>
                    <Link 
                        href={route('invoices.create')}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        + Generate Invoice
                    </Link>
                </div>
            }
        >
            <Head title="Invoices" />

            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-800/50">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Transaction ID</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Stakeholder Entity</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Type</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Total Value</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Temporal Stamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${invoice.type === 'sale' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                                        <span className="text-white font-black text-sm font-mono tracking-tighter uppercase italic">INV-{String(invoice.id).padStart(5, '0')}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-bold text-sm tracking-tight">{invoice.client.name}</span>
                                        <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{invoice.client.type}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border 
                                        ${invoice.type === 'sale' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                        {invoice.type}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-white font-black text-base tabular-nums">
                                    ${Number(invoice.total).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <span className="text-xs text-slate-500 font-bold tabular-nums">
                                        {new Date(invoice.created_at).toLocaleDateString()} {new Date(invoice.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
