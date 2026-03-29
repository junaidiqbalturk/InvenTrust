"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Book, Sparkles, HelpCircle, ArrowRight, PlayCircle, FileText, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HelpArticle {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: any;
}

const ARTICLES: HelpArticle[] = [
    {
        id: '1',
        title: 'How to create an invoice',
        description: 'Step-by-step guide to generating professional invoices.',
        category: 'Finance',
        icon: FileText
    },
    {
        id: '2',
        title: 'Managing global inventory',
        description: 'Learn how to track stock across multiple warehouses.',
        category: 'Inventory',
        icon: Book
    },
    {
        id: '3',
        title: 'Customizing your branding',
        description: 'Update your logo and colors for a personalized workspace.',
        category: 'Workspace',
        icon: Settings
    },
    {
        id: '4',
        title: 'Managing Import Orders',
        description: 'Full lifecycle tracking from purchase to warehouse arrival.',
        category: 'Trade',
        icon: PlayCircle
    }
];

interface HelpCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = ARTICLES.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-[400px] bg-[#020617] border-l border-white/10 h-full shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black text-white tracking-tight">Help Center</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    placeholder="Search resources..." 
                                    className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl focus:ring-primary/20 transition-all font-medium text-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Articles */}
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                            {filteredArticles.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredArticles.map((article) => (
                                        <motion.div
                                            key={article.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                                    <article.icon className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{article.category}</span>
                                            </div>
                                            <h3 className="text-white font-bold group-hover:text-primary transition-colors flex items-center justify-between">
                                                {article.title}
                                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{article.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 space-y-4">
                                    <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 mx-auto">
                                        <HelpCircle className="h-8 w-8 text-slate-500" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No resources found for "{searchQuery}"</p>
                                </div>
                            )}

                            <div className="pt-8">
                                <div className="rounded-[2rem] bg-gradient-to-br from-primary/20 to-violet-600/20 p-8 border border-primary/20 relative overflow-hidden group">
                                    <div className="relative z-10 space-y-4">
                                        <h4 className="text-white font-black leading-tight">Can't find what you're looking for?</h4>
                                        <p className="text-slate-300 text-sm">Our premium support team is available 24/7 for our enterprise clients.</p>
                                        <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                            Contact Support
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
