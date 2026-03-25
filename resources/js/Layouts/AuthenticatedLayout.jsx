import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30 font-sans antialiased overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-teal-500/5 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="flex h-screen relative z-10">
                {/* Sidebar */}
                <aside className="w-72 hidden md:flex flex-col border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
                    <div className="p-8">
                        <div className="flex items-center gap-3 group px-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                                InvenTrust
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-2">
                        <SidebarLink href={route('dashboard')} active={route().current('dashboard')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Dashboard
                        </SidebarLink>
                        
                        <div className="px-4 pt-6 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Management</div>
                        
                        <SidebarLink href={route('products.index')} active={route().current('products.*')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            Inventory
                        </SidebarLink>
                        
                        <SidebarLink href={route('invoices.index')} active={route().current('invoices.*')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Invoices
                        </SidebarLink>

                        <SidebarLink href={route('clients.index')} active={route().current('clients.*')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Contacts & Ledgers
                        </SidebarLink>

                        <div className="px-4 pt-6 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Operational</div>
                        
                        <SidebarLink href={route('inventory.movements')} active={route().current('inventory.movements')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            Stock Audit
                        </SidebarLink>

                        <SidebarLink href={route('tax-rules.index')} active={route().current('tax-rules.*')}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Tax Settings
                        </SidebarLink>
                    </nav>

                    <div className="p-4 border-t border-slate-800/50">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/10">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <div className="text-sm font-bold text-slate-200">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="top" width="48" contentClasses="py-1 bg-slate-800 border-slate-700">
                                <Dropdown.Link href={route('profile.edit')} className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors w-full text-left">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
                    <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/10 backdrop-blur-md">
                        <div>
                            {header}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group hidden sm:block">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" placeholder="Global Search..." className="pl-10 pr-4 py-2 bg-slate-800/30 border border-slate-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-xl text-sm transition-all w-64 placeholder-slate-600 outline-none" />
                            </div>
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all relative">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-emerald-500 rounded-full border-2 border-[#0f172a]"></span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
            `}} />
        </div>
    );
}

function SidebarLink({ href, active, children }) {
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group
                ${active 
                    ? 'text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                }`}
        >
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-lg shadow-emerald-500/50"></div>}
            <span className={`${active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors duration-300`}>
                {children[0]}
            </span>
            <span className="flex-1">{children[1]}</span>
            {!active && <svg className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
        </Link>
    );
}
