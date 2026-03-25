import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function ClientsShow({ auth, client }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-6">
                        <Link href={route('clients.index')} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Ledger Analytics: {client.name}
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{client.type} Fiscal Profile</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Net Position</span>
                        <h3 className={`text-3xl font-black tabular-nums tracking-tighter mt-1 ${client.balance < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                            ${Math.abs(client.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            <span className="text-base ml-2 uppercase opacity-50">{client.balance < 0 ? 'CREDIT' : 'DEBIT'}</span>
                        </h3>
                    </div>
                </div>
            }
        >
            <Head title={`Ledger - ${client.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Statistics Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-8">Node Parameters</h3>
                        <div className="space-y-10">
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Electronic Endpoint</label>
                                <span className="text-sm font-bold text-slate-200 block truncate italic">{client.email || 'N/A'}</span>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Comm Protocol</label>
                                <span className="text-sm font-bold text-slate-200 block italic">{client.phone || 'N/A'}</span>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Geo Coordinate</label>
                                <span className="text-xs font-bold text-slate-400 block leading-relaxed italic">{client.address || 'N/A'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-2xl border border-emerald-500/20 rounded-[2.5rem] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic mb-6">Activity metrics</h3>
                        <div className="space-y-1">
                            <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                {client.ledger_entries.length}
                            </span>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Atomic Transactions</p>
                        </div>
                    </section>
                </div>

                {/* Ledger Table */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                                Transaction Sequence
                            </h3>
                            <span className="px-6 py-2 bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700">Audit Trail Enabled</span>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-800/50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Label</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Debit (+)</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Credit (-)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/20">
                                {client.ledger_entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-500/[0.02] transition-colors group">
                                        <td className="px-10 py-8">
                                            <span className="text-xs text-slate-500 font-bold tabular-nums">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm tracking-tight">{entry.description}</span>
                                                {entry.invoice_id && (
                                                    <span className="text-emerald-500/50 text-[9px] font-black uppercase tracking-widest mt-1">Verified Invoice Linked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right font-black tabular-nums tracking-tighter">
                                            {entry.type === 'debit' ? (
                                                <span className="text-emerald-400 italic text-lg">${Number(entry.amount).toFixed(2)}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-10 py-8 text-right font-black tabular-nums tracking-tighter">
                                            {entry.type === 'credit' ? (
                                                <span className="text-rose-500 italic text-lg">${Number(entry.amount).toFixed(2)}</span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {client.ledger_entries.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <p className="text-slate-600 font-black uppercase tracking-[0.3em] italic">No transaction records found in ledger</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
