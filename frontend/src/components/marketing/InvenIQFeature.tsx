import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Zap, ShieldCheck, ArrowRight, MousePointer2 } from 'lucide-react';
import InvenIQAvatar from './InvenIQAvatar';
import Link from 'next/link';

const InvenIQFeature = () => {
    const features = [
        {
            icon: MessageSquare,
            title: "Conversational Setup",
            desc: "Skip the complex forms. InvenIQ guides you through a natural, human-like dialogue to build your hub.",
            color: "text-emerald-500"
        },
        {
            icon: Zap,
            title: "Zero-Wait Validation",
            desc: "Real-time error checking that helps, not hinders. Validations happen as you speak.",
            color: "text-[#059669]"
        },
        {
            icon: Sparkles,
            title: "Intelligent Logic",
            desc: "InvenIQ auto-detects your country and suggests local currencies and optimal business types.",
            color: "text-[#10B981]"
        }
    ];

    return (
        <section className="relative py-24 px-6 overflow-hidden bg-[#020617]">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-24 items-start">
                    {/* Left: Interactive Visual */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 p-12 rounded-[4rem] bg-[#061F1A]/60 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                            
                            <div className="relative z-20 space-y-10">
                                <div className="flex items-center gap-6">
                                    <InvenIQAvatar size="lg" className="h-20 w-20" />
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                            AI Concierge Active
                                        </div>
                                        <h4 className="text-3xl font-black text-white italic">"Hi 👋 I'm InvenIQ"</h4>
                                    </div>
                                </div>

                                {/* Simulated Chat Bubbles */}
                                <div className="space-y-6">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-white/5 p-6 rounded-3xl rounded-bl-none border border-white/5 max-w-[80%] text-slate-300 text-sm leading-relaxed"
                                    >
                                        I'll help you set up your smart inventory workspace in under 2 minutes. Ready to start?
                                    </motion.div>
                                    
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 1.2 }}
                                        className="ml-auto bg-[#059669] p-6 rounded-3xl rounded-br-none max-w-[80%] text-white text-sm font-bold shadow-xl shadow-[#059669]/20"
                                    >
                                        Let's do it! 🚀
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 2 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <MousePointer2 className="h-4 w-4 text-emerald-500 animate-bounce" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Interactive Onboarding Path</span>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Background Glowing Aura */}
                        <div className="absolute -inset-10 bg-emerald-500/10 rounded-full blur-[80px] -z-10 animate-pulse" />
                    </motion.div>

                    {/* Right: Copy & Features */}
                    <div className="space-y-12 lg:pt-14">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-emerald-500 font-black uppercase tracking-[0.5em] text-xs">AI Experience</h2>
                            <h3 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                                Meet InvenIQ: <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-primary">
                                    Your AI Inventory Specialist.
                                </span>
                            </h3>
                            <p className="text-slate-400 text-xl leading-relaxed">
                                Forget complex forms. Experience a guided, conversational setup that understands your business needs instantly.
                            </p>
                        </motion.div>

                        <div className="grid gap-8">
                            {features.map((feat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500">
                                        <feat.icon className={`h-6 w-6 ${feat.color} transition-transform group-hover:scale-110`} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{feat.title}</h4>
                                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="pt-8"
                        >
                            <Link href="/register-company" className="inline-flex items-center gap-4 bg-[#059669] hover:bg-[#064E3B] text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_40px_rgba(5,150,105,0.2)] hover:scale-105 active:scale-95">
                                Try InvenIQ AI Assistant
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InvenIQFeature;
