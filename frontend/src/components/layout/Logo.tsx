"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    textClassName?: string;
    isCollapsed?: boolean;
}

export const Logo = ({ 
    className, 
    size = 'md', 
    showText = true, 
    textClassName,
    isCollapsed = false 
}: LogoProps) => {
    
    const sizeClasses = {
        sm: {
            container: "h-8 w-8 rounded-xl",
            icon: "h-4 w-4",
            text: "text-xl"
        },
        md: {
            container: "h-10 w-10 rounded-xl",
            icon: "h-6 w-6",
            text: "text-2xl"
        },
        lg: {
            container: "h-12 w-12 rounded-2xl",
            icon: "h-7 w-7",
            text: "text-3xl"
        },
        xl: {
            container: "h-16 w-16 rounded-[2rem]",
            icon: "h-9 w-9",
            text: "text-4xl"
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <Link href="/" className={cn("flex items-center gap-4 group cursor-pointer", className)}>
            <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 1, type: "spring" }}
                className={cn(
                    "bg-gradient-to-tr from-[#059669] to-[#064E3B] flex items-center justify-center shadow-2xl shadow-[#059669]/40 flex-shrink-0",
                    currentSize.container
                )}
            >
                <Package className={cn("text-white", currentSize.icon)} />
            </motion.div>
            
            {showText && !isCollapsed && (
                <span className={cn(
                    "font-black tracking-tighter transition-all duration-300",
                    "bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500",
                    currentSize.text,
                    textClassName
                )}>
                    InvenTrust
                </span>
            )}
        </Link>
    );
};

export default Logo;
