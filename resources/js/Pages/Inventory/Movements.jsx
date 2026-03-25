import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function Movements({ auth, movements }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Atomic Flow Audit
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Stock Movement Sequence</p>
                </div>
            }
        >
            <Head title="Stock Audit" />

            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between bg-slate-800/20">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        Movement Intelligence
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock In</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Out</span>
                        </div>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-800/50">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Stamp</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Resource Identification</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Vector</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Quantum Delta</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Reference Context</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                        {movements.map(movement => (
                            <tr key={movement.id} className="hover:bg-slate-500/[0.02] transition-colors group">
                                <td className="px-10 py-8">
                                    <span className="text-xs text-slate-500 font-bold tabular-nums">
                                        {new Date(movement.created_at).toLocaleDateString()} {new Date(movement.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-sm tracking-tight italic uppercase">{movement.product.name}</span>
                                        <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-1">ID: {movement.product.sku}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border 
                                        ${movement.type === 'in' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                        {movement.type === 'in' ? 'Injection' : 'Extraction'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right font-black tabular-nums tracking-tighter text-xl">
                                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                                        {movement.reference_type.split('\\').pop()} #{movement.reference_id}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {movements.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-10 py-24 text-center">
                                    <p className="text-slate-600 font-black uppercase tracking-[0.3em] italic">No atomic movements recorded in vault</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
