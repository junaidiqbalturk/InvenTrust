import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function InvoicesCreate({ auth, clients, products }) {
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        type: 'sale',
        items: [{ product_id: '', quantity: 1, unit_price: 0, tax_amount: 0 }],
        subtotal: 0,
        tax_amount: 0,
        total: 0,
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: 1, unit_price: 0, tax_amount: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id == value);
            if (product) {
                newItems[index].unit_price = product.price;
                const taxRate = product.tax_rule ? product.tax_rule.rate_percentage : 0;
                newItems[index].tax_amount = (product.price * newItems[index].quantity * taxRate) / 100;
            }
        }

        if (field === 'quantity') {
            const product = products.find(p => p.id == newItems[index].product_id);
            if (product) {
                const taxRate = product.tax_rule ? product.tax_rule.rate_percentage : 0;
                newItems[index].tax_amount = (newItems[index].unit_price * value * taxRate) / 100;
            }
        }

        setData('items', newItems);
    };

    useEffect(() => {
        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const tax_amount = data.items.reduce((sum, item) => sum + item.tax_amount, 0);
        setData({
            ...data,
            subtotal,
            tax_amount,
            total: subtotal + tax_amount
        });
    }, [data.items]);

    const submit = (e) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Generate Fiscal Record
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">New Transaction Pipeline</p>
                </div>
            }
        >
            <Head title="Create Invoice" />

            <form onSubmit={submit} className="space-y-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Config */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-10 shadow-2xl">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Transaction Foundation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Stakeholder Entity</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl p-4 text-white outline-none transition-all appearance-none cursor-pointer"
                                        value={data.client_id}
                                        onChange={e => setData('client_id', e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500 italic">Select Client or Vendor...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id} className="bg-slate-900">{client.name} ({client.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Transaction Protocol</label>
                                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-700">
                                        <button 
                                            type="button"
                                            onClick={() => setData('type', 'sale')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.type === 'sale' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Sale / Stock Out
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setData('type', 'purchase')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.type === 'purchase' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Purchase / Stock In
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-slate-800/50 flex justify-between items-center bg-slate-800/20">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    Asset Allocation
                                </h3>
                                <button type="button" onClick={addItem} className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors flex items-center gap-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                    Append Record
                                </button>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0f172a]/30 text-slate-500 border-b border-slate-800/50">
                                        <tr>
                                            <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest">Target Item</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-24">QTY</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-40">Unit Price</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-40 text-right">Tax (VAT)</th>
                                            <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="group">
                                                <td className="px-10 py-6">
                                                    <select 
                                                        className="w-full bg-transparent border-0 text-white font-bold tracking-tight italic p-0 focus:ring-0 cursor-pointer appearance-none"
                                                        value={item.product_id}
                                                        onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                    >
                                                        <option value="" className="bg-slate-900">Select Asset...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id} className="bg-slate-900">{p.name} (${p.price})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-6 font-mono">
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-slate-800/30 border-0 rounded-lg p-2 text-white text-center focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                    />
                                                </td>
                                                <td className="px-6 py-6 font-mono">
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-slate-800/30 border-0 rounded-lg p-2 text-white text-right focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                                        value={item.unit_price}
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="px-6 py-6 text-right font-mono text-emerald-400 font-bold">
                                                    ${item.tax_amount.toFixed(2)}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button type="button" onClick={() => removeItem(index)} className="text-rose-500/30 hover:text-rose-500 transition-colors">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-10 shadow-2xl sticky top-8">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest italic mb-10 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                                Fiscal Summary
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Subtotal</span>
                                    <span className="text-white font-bold tabular-nums">${data.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Tax</span>
                                    <span className="text-emerald-400 font-bold tabular-nums">+ ${data.tax_amount.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-slate-800"></div>
                                <div className="flex justify-between items-end pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Payable</span>
                                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums mt-1 italic">
                                            ${data.total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors 
                                        ${data.type === 'sale' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" disabled={processing || !data.client_id || data.items.length === 0}
                                className="w-full mt-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100"
                            >
                                Execute & Post Record
                            </button>
                            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6">Secure Transaction Protocol Enabled</p>
                        </section>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
