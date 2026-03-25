import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Taxes({ auth, taxRules }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        rate_percentage: '',
        is_active: true,
        description: '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('tax-rules.store'), {
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
                            Fiscal Governance
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tax Configuration & Compliance</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg border border-slate-700 hover:border-emerald-500/50 transition-all active:scale-95"
                    >
                        + Define Rule
                    </button>
                </div>
            }
        >
            <Head title="Tax Rules" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {taxRules.map(rule => (
                    <div key={rule.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-slate-900 border border-slate-800/80 p-10 rounded-[2.5rem] backdrop-blur-sm h-full flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <span className={`h-3 w-3 rounded-full ${rule.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rule active</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase truncate">{rule.name}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6 italic">{rule.description || 'Global Policy Override'}</p>
                            
                            <div className="mt-auto pt-8 border-t border-slate-800/50 flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rate Magnitude</span>
                                    <span className="text-4xl font-black text-white tracking-tighter tabular-nums mt-1">
                                        {rule.rate_percentage}<span className="text-xl text-emerald-500 ml-1">%</span>
                                    </span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/30 transition-all">
                                    <svg className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 21a11.955 11.955 0 01-9.618-7.016m19.236 0A11.955 11.955 0 0112 3a11.955 11.955 0 019.618 7.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Redesign */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1e293b] w-full max-w-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white italic tracking-tight">Define Governance Rule</h3>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 text-slate-500 hover:text-white transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Rule Designation</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                    placeholder="e.g. VAT 15% Standard"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Rate Percentage</label>
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="0.00"
                                        value={data.rate_percentage}
                                        onChange={e => setData('rate_percentage', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Protocol Status</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all appearance-none cursor-pointer"
                                        value={data.is_active}
                                        onChange={e => setData('is_active', e.target.value === 'true' ? true : false)}
                                    >
                                        <option value="true" className="bg-slate-900 text-white">ACTIVE</option>
                                        <option value="false" className="bg-slate-900 text-white">INACTIVE</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Contextual Description</label>
                                    <textarea 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="Define rule applicability..."
                                        rows="3"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="pt-6">
                                <button 
                                    type="submit" disabled={processing}
                                    className="w-full py-5 bg-gradient-to-r from-slate-700 to-slate-900 text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:shadow-emerald-500/10 transition-all border border-slate-700 hover:border-emerald-500/30 disabled:opacity-50"
                                >
                                    Instantiate Policy Node
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
