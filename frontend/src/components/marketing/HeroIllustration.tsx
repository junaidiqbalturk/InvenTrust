import React from 'react';
import { motion } from 'framer-motion';
import { Ship, DollarSign, Activity, Globe, Shield, Zap, Database, BarChart3, TrendingUp } from 'lucide-react';

const HeroIllustration = () => {
    return (
        <div className="relative w-full aspect-square max-w-[700px] flex items-center justify-center -mt-5 lg:-mt-10 overflow-visible">
            
            {/* Background Narrative Layers */}
            <div className="absolute inset-0 z-0">
                {/* Glowing Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[#059669]/20 via-[#10B981]/10 to-transparent blur-[120px] rounded-full" />
                
                {/* Orbital Rings - Thinned and spread */}
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30 + i * 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/[0.05] rounded-full"
                        style={{ width: `${70 + i * 25}%`, height: `${70 + i * 25}%` }}
                    />
                ))}
            </div>

            {/* Main Visual: Data Network Globe */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-[120%] h-[120%] text-[#059669]/20 drop-shadow-2xl">
                    <defs>
                        <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#020617" stopOpacity="0.6" />
                        </radialGradient>
                    </defs>
                    
                    {/* The Globe Sphere */}
                    <circle cx="200" cy="200" r="140" fill="url(#globeGrad)" stroke="white" strokeOpacity="0.05" />
                    
                    {/* Latitude/Longitude Mesh */}
                    <g className="opacity-40">
                        <path d="M60 200 Q 200 100 340 200 T 60 200" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M60 200 Q 200 300 340 200 T 60 200" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M200 60 Q 150 200 200 340 T 200 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M200 60 Q 250 200 200 340 T 200 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </g>

                    {/* Dynamic Connection Lines (Pulses) */}
                    <motion.path 
                        d="M120 120 Q 200 60 280 120" 
                        stroke="#10B981" strokeWidth="1" fill="none" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                        d="M100 250 Q 200 340 300 250" 
                        stroke="#059669" strokeWidth="1" fill="none" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    {/* Activity Nodes */}
                    {[
                        { x: 120, y: 120, color: "#10B981" },
                        { x: 280, y: 120, color: "#10B981" },
                        { x: 100, y: 250, color: "#059669" },
                        { x: 300, y: 250, color: "#059669" },
                        { x: 200, y: 200, color: "#6EE7B7" }
                    ].map((node, i) => (
                        <g key={i}>
                            <motion.circle 
                                initial={{ r: 2 }}
                                animate={{ r: [2, 6, 2], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                cx={node.x} cy={node.y} r="2" fill={node.color} 
                            />
                            <circle cx={node.x} cy={node.y} r="2" fill={node.color} />
                        </g>
                    ))}
                </svg>

                {/* Glassmorphic Macro-Cards - ENLARGED AND SPREAD OUT */}
                
                {/* Top-Right: Financial Integrity */}
                <motion.div 
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [0, -15, 0] }}
                    transition={{ duration: 1, delay: 0.2, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                    className="absolute top-4 -right-2 p-7 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col gap-4 min-w-[280px]"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/20 text-[#10B981]">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div className="text-right">
                             <span className="text-[10px] font-black tracking-[0.2em] text-[#10B981] uppercase">Live Spread</span>
                             <div className="h-1.5 w-16 bg-[#10B981]/20 rounded-full mt-2 overflow-hidden text-left">
                                 <motion.div animate={{ x: [-64, 64] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-6 bg-[#10B981]" />
                             </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white tracking-tighter">$14,284.00</p>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Ledger Verified • Real-time</p>
                    </div>
                </motion.div>

                {/* Left-Middle: Logistics Control */}
                <motion.div 
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [0, 15, 0] }}
                    transition={{ duration: 1, delay: 0.4, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                    className="absolute top-[30%] -left-6 p-7 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-6"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#059669]/20 text-[#059669]">
                        <Ship className="h-8 w-8" />
                    </div>
                    <div className="pr-6">
                        <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Tracking Transit</p>
                        <p className="text-lg font-black text-white">CN-XIN-902</p>
                        <div className="flex gap-1.5 mt-2">
                             {[1,1,1,0.4].map((op, i) => <div key={i} className="h-1.5 w-5 rounded-full bg-[#059669]" style={{ opacity: op }} />)}
                        </div>
                    </div>
                </motion.div>

                {/* Bottom-Center: Compliance Shield */}
                <motion.div 
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, delay: 0.6, scale: { duration: 6, repeat: Infinity } }}
                    className="absolute -bottom-8 left-0 p-5 px-10 rounded-full bg-[#020617]/95 border border-white/10 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex items-center gap-5"
                >
                    <div className="h-12 w-12 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                        <Shield className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">Global Compliance Active</span>
                    <div className="h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_15px_#10B981] animate-pulse" />
                </motion.div>

                {/* Animated Flow Orbs */}
                {[0, 1, 2].map(i => (
                    <motion.div
                       key={i}
                       animate={{ 
                           x: [0, Math.cos(i) * 200, 0], 
                           y: [0, Math.sin(i) * 200, 0],
                           opacity: [0, 1, 0],
                           scale: [0, 1, 0]
                       }}
                       transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 3 }}
                       className="absolute w-2 h-2 rounded-full bg-white/20 blur-[1px]"
                    />
                ))}
            </div>

            {/* Micro-Details: Data Strings */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none opacity-20 hidden lg:block">
                 <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#059669] space-y-1">
                     <div>// TRUST_CORE_INIT</div>
                     <div>010110101011</div>
                     <div>FLOW_SYNC_MASTER</div>
                 </div>
                 <div className="absolute bottom-0 left-0 p-4 font-mono text-[8px] text-[#10B981] space-y-1">
                     <div>SYSTEM_V.4.2</div>
                     <div>AUTH_ENCRYPTED</div>
                 </div>
             </div>

        </div>
    );
};

export default HeroIllustration;
