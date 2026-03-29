import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type InvenIQState = 'idle' | 'listening' | 'thinking' | 'responding';

interface InvenIQAvatarProps {
    className?: string;
    state?: InvenIQState;
    isTyping?: boolean; // Legacy support
    size?: 'sm' | 'md' | 'lg';
}

const InvenIQAvatar = ({ className = '', state = 'idle', isTyping, size = 'md' }: InvenIQAvatarProps) => {
    // Handle legacy isTyping prop
    const currentState: InvenIQState = isTyping ? 'thinking' : state;
    
    const dimensions = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
    
    // Animation Variants
    const orbVariants = {
        idle: {
            scale: [1, 1.05, 1],
            y: [0, -4, 0],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" as any
            }
        },
        thinking: {
            scale: [1, 1.15, 1],
            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut" as any
            }
        },
        listening: {
            scale: 1.02,
            filter: "brightness(1.3)",
            transition: { duration: 0.3 }
        },
        responding: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" as any
            }
        }
    };

    const glowVariants = {
        idle: { opacity: 0.4, scale: 1 },
        thinking: {
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
            transition: { duration: 1, repeat: Infinity }
        },
        listening: { opacity: 0.7, scale: 1.1 },
        responding: {
            opacity: [0.5, 0.9, 0.5],
            scale: [1, 1.2, 1],
            transition: { duration: 2, repeat: Infinity }
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
            {/* Outer Atmospheric Glow */}
            <motion.div 
                variants={glowVariants}
                animate={currentState}
                className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl"
            />

            {/* Pulsing Ring */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-[-20%] rounded-full border border-cyan-400/20"
            />

            {/* Main Orb Body */}
            <motion.div
                variants={orbVariants}
                animate={currentState}
                className="relative h-full w-full rounded-full overflow-hidden flex items-center justify-center border border-white/20 shadow-2xl"
                style={{
                    background: 'radial-gradient(circle at 30% 30%, #60a5fa 0%, #3b82f6 40%, #1d4ed8 100%)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                {/* Internal Light Refraction */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                
                {/* Secondary Accent (Purple/Teal Glow inside) */}
                <motion.div 
                    animate={{ 
                        opacity: [0, 0.4, 0],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="absolute inset-0 bg-purple-500/20 blur-xl"
                />

                {/* The "Neural" Core */}
                <div className="relative z-10 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff,0_0_30px_#3b82f6]" />
                
                {/* Subtle Surface Texture */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}
                />
            </motion.div>

            {/* Status Dot */}
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20" />
        </div>
    );
};

export default InvenIQAvatar;
