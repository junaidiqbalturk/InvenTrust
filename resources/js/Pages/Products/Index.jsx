import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function ProductsIndex({ auth, products, taxRules }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        sku: '',
        price: '',
        tax_rule_id: '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Inventory Matrix
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Asset Management & SKU Tracking</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        + Register Product
                    </button>
                </div>
            }
        >
            <Head title="Inventory Management" />

            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-slate-800/50">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Asset Identity</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Base Valuation</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Tax Group</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Quantum Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-emerald-500/[0.03] transition-colors group border-transparent">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover:border-emerald-500/30 transition-all">
                                            <svg className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-base tracking-tight group-hover:text-emerald-400 mt-1 transition-colors uppercase italic">{product.name}</span>
                                            <span className="text-slate-600 text-xs font-mono tracking-wider">{product.sku || 'SKU_GEN_AUTO'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-white font-bold tabular-nums">
                                    ${Number(product.price).toFixed(2)}
                                </td>
                                <td className="px-10 py-8">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-slate-800/50 text-slate-400 border border-slate-700 uppercase tracking-widest">
                                        {product.tax_rule?.name || 'Tax Exempt'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black tabular-nums tracking-tighter ${product.stock_quantity <= 10 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                            {product.stock_quantity}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">In Reserve</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Redesign - Glass-over-Dark */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1e293b] w-full max-w-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white italic tracking-tight">Register New Asset</h3>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 text-slate-500 hover:text-white transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Product Designation</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="Enter product name..."
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Unique SKU</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700 font-mono" 
                                        placeholder="PRO-XXXX-ZZ"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Unit Valuation</label>
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="0.00"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Fiscal Tax Rule</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all appearance-none cursor-pointer"
                                        value={data.tax_rule_id}
                                        onChange={e => setData('tax_rule_id', e.target.value)}
                                    >
                                        <option value="" className="bg-slate-900">No Tax (Exempt)</option>
                                        {taxRules.map(rule => (
                                            <option key={rule.id} value={rule.id} className="bg-slate-900">{rule.name} ({rule.rate_percentage}%)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6">
                                <button 
                                    type="submit" disabled={processing}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Confirm Asset Injection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
