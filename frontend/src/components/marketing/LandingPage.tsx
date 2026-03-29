"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroIllustration from './HeroIllustration';
import InvenIQFeature from './InvenIQFeature';
import { Logo } from '@/components/layout/Logo';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, 
    Ship, 
    Plane, 
    Globe, 
    BarChart3, 
    ShieldCheck, 
    Zap, 
    ChevronRight,
    Users,
    FileText,
    TrendingUp,
    CheckCircle2,
    Database,
    CreditCard,
    Boxes,
    FileSearch,
    PieChart,
    Truck,
    LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 100 },
        },
    };

    const FeatureCard = ({ icon: Icon, title, description, color, stats }: any) => (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative group p-8 rounded-[2.5rem] bg-[#064E3B]/40 border border-white/5 backdrop-blur-xl transition-all duration-500 hover:border-[#059669]/30 hover:bg-[#064E3B]/60 shadow-2xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 rounded-[2.5rem]`} />
            
            <div className={`h-16 w-16 mb-8 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`h-8 w-8 text-[#059669] group-hover:text-[#6EE7B7] transition-colors`} />
            </div>

            <h4 className="text-2xl font-black mb-4 text-white group-hover:text-[#059669] transition-colors">{title}</h4>
            <p className="text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">{description}</p>
            
            {stats && (
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#059669]/60">{stats.label}</span>
                    <span className="text-sm font-bold text-[#6EE7B7]">{stats.value}</span>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#059669]/30 overflow-x-hidden font-sans">
            {/* Dynamic Background Aura */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#061F1A,transparent)]" />
                <div className="absolute top-[15%] right-[-10%] w-[600px] h-[600px] bg-[#059669]/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-[150px]" />
            </div>

            {/* Premium Navbar */}
            <nav className="fixed top-0 w-full z-[100] bg-[#020617]/50 backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <Logo size="lg" />
                    
                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <a href="#solutions" className="hover:text-[#059669] transition-colors">Solutions</a>
                        <a href="#financials" className="hover:text-[#6EE7B7] transition-colors">Financials</a>
                        <a href="#logistics" className="hover:text-[#10B981] transition-colors">Logistics</a>
                        <a href="#analytics" className="hover:text-[#059669] transition-colors">Insights</a>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">
                            Log In
                        </Link>
                        <Link href="/register-company" className="relative group overflow-hidden bg-[#059669] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl shadow-[#059669]/40 hover:scale-105 active:scale-95">
                            <span className="relative z-10 text-white">Get Started</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#6EE7B7] to-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center min-h-[700px]">
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="lg:col-span-7 space-y-8"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#059669]/10 border border-[#059669]/20 text-[#059669] text-[10px] font-black uppercase tracking-[0.4em]">
                            <motion.span 
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 rounded-full bg-[#059669]" 
                            />
                            Next Gen Inventory Platform
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
                            Inventory Excellence, <br />
                            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-primary py-1 px-1">
                                Mastered with Intelligence.
                            </span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-2xl text-slate-400 max-w-xl leading-relaxed font-medium">
                            The definitive enterprise ecosystem for smart inventory intelligence. Seamlessly synchronizing multi-warehouse logistics, financial ledgers, and automated stock alerts.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4">
                            <Link href="/register-company" className="group bg-[#059669] hover:bg-[#064E3B] text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center gap-4 shadow-[0_20px_40px_rgba(5,150,105,0.3)]">
                                Launch Workspace
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link href="/login" className="bg-white/5 hover:bg-white/10 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                                Watch Preview
                            </Link>
                        </motion.div>

                        <div className="grid sm:grid-cols-3 gap-6 mt-16 max-w-4xl">
                            {[
                                { 
                                    icon: Users, 
                                    val: "500+", 
                                    label: "Global Enterprises", 
                                    desc: "Trusting our infrastructure everyday.", 
                                    color: "text-[#059669]",
                                    bg: "bg-[#059669]/5"
                                },
                                { 
                                    icon: TrendingUp, 
                                    val: "$4B+", 
                                    label: "Inventory Value", 
                                    desc: "Managed via InvenIQ Intelligence.", 
                                    color: "text-[#6EE7B7]",
                                    bg: "bg-[#6EE7B7]/5"
                                },
                                { 
                                    icon: ShieldCheck, 
                                    val: "100%", 
                                    label: "Compliance", 
                                    desc: "Verified by global trade standards.", 
                                    color: "text-[#10B981]",
                                    bg: "bg-[#10B981]/5"
                                }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group transition-all duration-500 hover:border-[#059669]/30"
                                >
                                    <div className={`h-14 w-14 rounded-2xl ${stat.bg} border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className={`h-7 w-7 ${stat.color}`} />
                                    </div>
                                    <h4 className="text-4xl font-black text-white tracking-tighter mb-2">{stat.val}</h4>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.color} mb-3`}>{stat.label}</p>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{stat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="lg:col-span-5 relative flex items-center justify-center min-h-[500px]"
                    >
                        <HeroIllustration />
                        {/* Glowing Halo */}
                        <div className="absolute -inset-20 bg-[#059669]/20 rounded-full blur-[120px] -z-10 animate-pulse" />
                    </motion.div>
                </div>
            </section>

            {/* InvenIQ AI Feature Section */}
            <InvenIQFeature />

            {/* Application Features */}
            <section id="solutions" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-28 space-y-8"
                    >
                        <h2 className="text-emerald-500 font-black uppercase tracking-[0.5em] text-xs">Platform Core</h2>
                        <h3 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                Enterprise Solutions.
                            </span>
                        </h3>
                        <p className="text-slate-400 text-2xl max-w-3xl mx-auto leading-relaxed">Integrated trade management designed for the highest level of detail and efficiency.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={Boxes} 
                            title="Multi-Warehouse" 
                            description="End-to-end stock tracking with automated reorder points and intelligent location allocation."
                            stats={{ label: "Inventory Accuracy", value: "+99%" }}
                            color="from-[#059669] to-[#6EE7B7]"
                        />
                        <FeatureCard 
                            icon={FileSearch} 
                            title="Voucher Control" 
                            description="Authorative ledger management with multi-level approval cycles for every financial entry."
                            stats={{ label: "Integrity Index", value: "A+" }}
                            color="from-[#6EE7B7] to-[#10B981]"
                        />
                        <FeatureCard 
                            icon={Database} 
                            title="Secure Archive" 
                            description="Centrally managed document repository for all partners, vendors, and historical shipments."
                            stats={{ label: "Uptime", value: "100%" }}
                            color="from-[#10B981] to-[#020617]"
                        />
                        <FeatureCard 
                            icon={FileText} 
                            title="Document AI" 
                            description="Instant generation of Invoices, Delivery Notes, and GRN copies linked to live inventory data."
                            stats={{ label: "Processing Speed", value: "0ms" }}
                            color="from-[#059669] to-[#10B981]"
                        />
                        <FeatureCard 
                            icon={Truck} 
                            title="Vendor Bills" 
                            description="Streamlined Payables and Receivables with automated aging reports and tax indexing."
                            stats={{ label: "ROI Status", value: "Optimized" }}
                            color="from-[#6EE7B7] to-[#059669]"
                        />
                        <FeatureCard 
                            icon={ShieldCheck} 
                            title="Brand Sync" 
                            description="Total brand control. Adapt the entire dashboard to your corporate identity in seconds."
                            stats={{ label: "White Label", value: "Ready" }}
                            color="from-[#10B981] to-[#6EE7B7]"
                        />
                    </div>
                </div>
            </section>

            {/* Financial Precision Section */}
            <section id="financials" className="py-24 px-6 bg-[#1A2451]/20 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                                Financial <br /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                    Precision.
                                </span>
                            </h2>
                            <p className="text-slate-400 text-2xl leading-relaxed italic border-l-4 border-[#98B9F2] pl-8">
                                Complete Double-Entry Ledger management tailored for global trade entities.
                            </p>
                        </motion.div>

                        <div className="grid gap-10">
                            {[
                                { title: 'Double-Entry Core', desc: 'Secure, immutable financial records for every trade node.' },
                                { title: 'Dynamic Aging', desc: 'Real-time visibility into your Debtors and Creditors.' },
                                { title: 'Multi-Asset Link', desc: 'Synchronize physical inventory with financial ledgers.' }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-8 group"
                                >
                                    <div className="h-16 w-16 rounded-3xl bg-[#059669]/10 flex items-center justify-center shrink-0 border border-[#059669]/20 group-hover:bg-[#059669] group-hover:scale-110 transition-all duration-500">
                                        <CheckCircle2 className="h-8 w-8 text-[#059669] group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white">{item.title}</h4>
                                        <p className="text-slate-500 text-lg mt-2 font-medium">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        className="relative p-1 rounded-[4rem] bg-gradient-to-br from-[#059669] via-[#6EE7B7] to-[#10B981] shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
                    >
                        <div className="rounded-[3.9rem] bg-[#020617] p-12 space-y-10 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                                <CreditCard className="h-64 w-64 text-white" />
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-10">
                                <h4 className="text-2xl font-black">Trade Ledger</h4>
                                <LayoutDashboard className="h-8 w-8 text-[#98B9F2]" />
                            </div>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Export Revenue', val: 'PKR 8,420,000', color: 'text-[#059669]' },
                                    { label: 'Duty & Taxes', val: 'PKR 1,120,500', color: 'text-[#10B981]' },
                                    { label: 'Net Liquidity', val: 'PKR 7,299,500', color: 'text-[#6EE7B7]' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                                        <span className="font-bold text-slate-400">{item.label}</span>
                                        <span className={`text-2xl font-black ${item.color}`}>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Logistics Visualization Grid */}
            <section id="logistics" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-32 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { icon: Ship, label: 'Maritime', val: '214 SHIPS' },
                                    { icon: Plane, label: 'Sky Cargo', val: '45 FLIGHTS' },
                                    { icon: Globe, label: 'Customs', val: '99% PASS' },
                                    { icon: Boxes, label: 'Warehousing', val: '24/7 LIVE' }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-12 rounded-[3.5rem] bg-[#064E3B]/40 border border-white/5 text-center space-y-6 hover:border-[#10B981]/50 hover:bg-[#064E3B]/80 transition-all group"
                                    >
                                        <item.icon className="h-16 w-16 text-[#10B981] mx-auto transition-all group-hover:rotate-12 group-hover:scale-125 group-hover:text-[#6EE7B7] duration-500" />
                                        <div>
                                            <h4 className="text-2xl font-black text-white">{item.label}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">{item.val}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-12">
                            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                                Modern <br /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                    Supply Chain.
                                </span>
                            </h2>
                            <p className="text-2xl text-slate-400 leading-relaxed font-medium">
                                Autonomous container tracking and vessel synchronization. Real-time updates delivered to your dashboard via verified satellite nodes.
                            </p>
                            <Link href="/register-company" className="inline-flex items-center gap-6 text-white font-black uppercase tracking-[0.5em] text-xs group">
                                Explore Logistics
                                <div className="h-14 w-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-all">
                                    <ChevronRight className="h-6 w-6" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insights / Data Grid */}
            <section id="analytics" className="py-24 px-6 bg-[#020617]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-24 items-center">
                        <div className="lg:col-span-5 space-y-16">
                            <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">
                                Trade <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">Intelligence.</span>
                            </h2>
                            <div className="space-y-12">
                                {[
                                    { icon: PieChart, title: 'Analytic Layers', desc: 'Holistic revenue, expenditure and shipment density visuals.' },
                                    { icon: FileText, title: 'Executive Data', desc: 'Secure PDF summaries for board-level trade reviews.' },
                                    { icon: Database, title: 'History Vault', desc: 'Immutable records of every document generated.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#059669] transition-all duration-700 border border-white/5">
                                            <item.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white group-hover:text-[#059669] transition-colors">{item.title}</h4>
                                            <p className="text-slate-500 text-lg mt-2 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <motion.div 
                                initial={{ opacity: 0, rotateX: 20 }}
                                whileInView={{ opacity: 1, rotateX: 0 }}
                                viewport={{ once: true }}
                                className="relative p-12 rounded-[4rem] bg-gradient-to-br from-[#064E3B]/50 to-transparent border border-white/5 shadow-2xl overflow-hidden"
                            >
                                <div className="relative z-10 grid grid-cols-2 gap-10">
                                    <div className="p-10 rounded-3xl bg-black/40 border border-white/5 space-y-6">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Global Coverage</span>
                                        <div className="text-5xl font-black text-white">PKR 92M</div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '84%' }}
                                                className="h-full bg-[#10B981]" 
                                            />
                                        </div>
                                    </div>
                                    <div className="p-10 rounded-3xl bg-black/40 border border-white/5 space-y-6">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Margin Index</span>
                                        <div className="text-5xl font-black text-white">24.5%</div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '65%' }}
                                                className="h-full bg-[#059669]" 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 p-10 rounded-3xl bg-black/40 border border-white/5">
                                        <div className="flex items-center justify-between mb-12">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Trade Volume Analysis</span>
                                            <Globe className="h-5 w-5 text-[#10B981]" />
                                        </div>
                                        <div className="flex items-end gap-5 h-48">
                                            {[40, 70, 45, 95, 60, 80, 50, 90].map((h, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${h}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.1, duration: 1 }}
                                                    className="flex-1 bg-gradient-to-t from-[#020617] via-[#059669] to-[#10B981]" 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA High Impact */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto rounded-[5rem] overflow-hidden relative shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#059669] via-[#020617] to-[#10B981]" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 p-20 lg:p-40 text-center space-y-16">
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="text-6xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-primary"
                        >
                            The Next Era <br/> Of Smart Inventory.
                        </motion.h2>
                        <p className="text-white/80 text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed font-bold italic">
                            Your brand. Your data. Your inventory empire. Tailored for excellence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                            <Link href="/register-company" className="bg-white text-[#020617] px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                Get Started
                            </Link>
                            <Link href="/login" className="bg-transparent text-white border-2 border-white/20 px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/5 transition-all">
                                Account Access
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Premium */}
            <footer className="pt-24 pb-0 px-6 border-t border-white/5 relative bg-[#020617]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-24">
                    <div className="lg:col-span-5 space-y-12">
                        <Logo size="md" />
                        <p className="text-xl text-slate-500 leading-relaxed max-w-sm">
                            Innovating the structure of global trade through intelligence, automation, and premium design language.
                        </p>
                        <div className="flex gap-6">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#059669] hover:scale-110 transition-all cursor-pointer">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
                        <div className="space-y-8">
                            <h4 className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Solutions</h4>
                            <div className="space-y-4 text-slate-500 font-bold text-sm">
                                <a href="#" className="block hover:text-[#059669] transition-colors">Imports</a>
                                <a href="#" className="block hover:text-[#059669] transition-colors">Exports</a>
                                <a href="#" className="block hover:text-[#059669] transition-colors">Ledgers</a>
                                <a href="#" className="block hover:text-[#059669] transition-colors">Documents</a>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Company</h4>
                            <div className="space-y-4 text-slate-500 font-bold text-sm">
                                <a href="#" className="block hover:text-[#6EE7B7] transition-colors">About Us</a>
                                <a href="#" className="block hover:text-[#6EE7B7] transition-colors">Pricing</a>
                                <a href="#" className="block hover:text-[#6EE7B7] transition-colors">Contact</a>
                                <a href="#" className="block hover:text-[#6EE7B7] transition-colors">Privacy</a>
                            </div>
                        </div>
                        <div className="space-y-8 col-span-2 md:col-span-1">
                            <h4 className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Global</h4>
                            <div className="space-y-4 text-slate-500 font-bold text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Network Active</span>
                                </div>
                                <p>Headquarters: Pakistan</p>
                                <p>Ops: Global Nodes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-footer */}
                <div className="bg-black/20 py-10 px-6 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                        <p>© 2026 InvenTrust Global Solutions. Intelligence Engineered.</p>
                        <div className="flex gap-10">
                            <span>ISO 27001</span>
                            <span>SOC2 Compliant</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
