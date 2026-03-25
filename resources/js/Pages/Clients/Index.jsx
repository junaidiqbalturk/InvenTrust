import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function ClientsIndex({ auth, clients }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        type: 'customer',
        email: '',
        phone: '',
        address: '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('clients.store'), {
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
                            Node Ecosystem
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Client & Vendor Directory</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95"
                    >
                        + Register Node
                    </button>
                </div>
            }
        >
            <Head title="Contacts" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clients.map(client => (
                    <div key={client.id} className="relative group perspective-1000">
                        <div className={`absolute -inset-0.5 rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000 
                            ${client.type === 'vendor' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        <div className="relative bg-slate-900 border border-slate-800/80 p-8 rounded-[2.5rem] backdrop-blur-sm flex flex-col h-72">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black italic shadow-2xl transition-transform group-hover:rotate-12
                                    ${client.type === 'vendor' 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {client.name.charAt(0)}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border
                                    ${client.type === 'vendor' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'}`}>
                                    {client.type}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-white italic tracking-tight mb-2 group-hover:text-emerald-400 transition-colors uppercase truncate">{client.name}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-auto truncate">{client.email || 'NO_IDENTIFIER_RECORDED'}</p>
                            
                            <div className="h-px bg-slate-800/50 my-6"></div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Balance</span>
                                    <span className={`text-lg font-black tabular-nums tracking-tighter ${client.balance < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        ${Math.abs(client.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        <span className="text-[10px] ml-1 uppercase">{client.balance < 0 ? 'CR' : 'DR'}</span>
                                    </span>
                                </div>
                                <Link href={route('clients.show', client.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </Link>
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
                            <h3 className="text-2xl font-black text-white italic tracking-tight">Register Node</h3>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 text-slate-500 hover:text-white transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Legal Identity</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="Company Name Ltd..."
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Node Classification</label>
                                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-700">
                                        <button 
                                            type="button"
                                            onClick={() => setData('type', 'customer')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.type === 'customer' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Customer Node
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setData('type', 'vendor')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.type === 'vendor' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Vendor / Supplier
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Electronic Mail</label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="id@ecosystem.gov"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Comm Channel</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="+00 XXXXX XXXXX"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="pt-6">
                                <button 
                                    type="submit" disabled={processing}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Initialize Node Integration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
