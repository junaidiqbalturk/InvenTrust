import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, totalSales, outstandingBalances, lowStockProducts }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Overview Central
                    </h2>
                    <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase">System Performance & Insights</p>
                </div>
            }
        >
            <Head title="Premium Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Sale Card */}
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900 border border-slate-800/50 p-8 rounded-3xl leading-none flex flex-col justify-between h-48 overflow-hidden backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Net Sales Revenue</p>
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-white tracking-tighter">
                                ${Number(totalSales).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </h3>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                <span>Realtime Analytics Active</span>
                            </div>
                        </div>
                        {/* Background SVG Decoration */}
                        <svg className="absolute -bottom-1 -right-4 h-24 w-24 text-emerald-500/5 -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h2.25c.05 1.15.93 1.59 2.15 1.59 1.48 0 2.21-.77 2.21-1.7 0-2.48-5.32-1.25-5.32-4.52 0-1.7 1.25-2.92 3.01-3.26V5h2.67v1.95c1.54.31 2.87 1.29 2.94 3.05h-2.22c-.11-1.04-.93-1.43-1.95-1.43-1.2 0-2.02.68-2.02 1.63 0 2.38 5.32 1.22 5.32 4.6 0 1.67-1.16 2.97-3.1 3.29z"/></svg>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900 border border-slate-800/50 p-8 rounded-3xl leading-none flex flex-col justify-between h-48 overflow-hidden backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Outstanding Ledger</p>
                            <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.04l.53-.81a15.54 15.54 0 011.834-2.314M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 3.04l-.53.81c-.44.672-1.055 1.45-1.834 2.314M12 11V3m0 8v8m0-8h.01" /></svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-rose-500 tracking-tighter">
                                ${Number(outstandingBalances).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <span>Requires Settlement</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900 border border-slate-800/50 p-8 rounded-3xl leading-none flex flex-col justify-between h-48 overflow-hidden backdrop-blur-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Stock Health</p>
                            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-white tracking-tighter">
                                {lowStockProducts.length} <span className="text-slate-600 text-lg uppercase tracking-widest ml-1 font-bold">Alerts</span>
                            </h3>
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                <span>Refill Suggested</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Table Section */}
            <div className="relative">
                {/* Glow behind table */}
                <div className="absolute -inset-4 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between bg-slate-800/20">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Critical Inventory</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Automated Stock Surveillance</p>
                            </div>
                        </div>
                        <Link href={route('products.index')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 hover:border-emerald-500/30">
                            Full Inventory &rarr;
                        </Link>
                    </div>

                    <div className="p-0">
                        {lowStockProducts.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-800/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Product Node</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Category ID</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Live Stock</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {lowStockProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-base tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic">{product.name}</span>
                                                    <span className="text-slate-600 text-xs font-mono mt-1">{product.sku || 'UNRECOGNIZED_SKU'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
                                                    HARDWARE_DISTRIBUTION
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right font-black text-white text-xl tabular-nums tracking-tighter">
                                                {product.stock_quantity}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest shadow-lg shadow-rose-500/5">
                                                    Depleting Fast
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-24 text-center">
                                <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 mx-auto rounded-[2rem] flex items-center justify-center mb-6 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">Inventory Safe</h4>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">All stock levels are optimal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
