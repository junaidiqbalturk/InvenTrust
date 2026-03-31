import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Loader2, RefreshCw, Sparkles, Building2, Globe2, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import InvenIQAvatar from './InvenIQAvatar';

interface Message {
    id: string;
    text: string;
    sender: 'inveniq' | 'user';
    type?: 'text' | 'options' | 'summary' | 'success' | 'loader';
    options?: { label: string; value: string; icon?: React.ReactNode }[];
}

interface FormData {
    name: string;
    email: string;
    password: string;
    company_name: string;
    country: string;
    currency: string;
    industry: string;
    bank_name: string;
    account_number: string;
    coa_type: 'standard' | 'minimal';
}

type InvenIQState = 'idle' | 'listening' | 'thinking' | 'responding';

interface InvenIQBotProps {
    onComplete: (data: any) => void;
    onSwitchToManual: () => void;
}

const InvenIQBot = ({ onComplete, onSwitchToManual }: InvenIQBotProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [invenIQState, setInvenIQState] = useState<InvenIQState>('idle');
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        company_name: '',
        country: '',
        currency: '',
        industry: '',
        bank_name: '',
        account_number: '',
        coa_type: 'standard'
    });
    const [isCreating, setIsCreating] = useState(false);
    const hasInitialized = useRef(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const savedData = localStorage.getItem('inveniq_v1_data');
        const savedStep = localStorage.getItem('inveniq_v1_step');
        
        if (savedData && savedStep) {
            const data = JSON.parse(savedData);
            setFormData(data);
            const s = parseInt(savedStep);
            
            if (s === 0) {
                triggerStep(0);
                return;
            }

            setStep(s);
            setMessages([{
                id: 'resume',
                text: `Welcome back! I've saved your progress. Let's continue. 🚀`,
                sender: 'inveniq'
            }]);
            triggerStep(s, data);
        } else {
            triggerStep(0);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        localStorage.setItem('inveniq_v1_data', JSON.stringify(formData));
        localStorage.setItem('inveniq_v1_step', step.toString());
    }, [messages, formData, step, isTyping]);

    const addInvenIQMessage = async (text: string, options?: Message['options'], type: Message['type'] = 'text') => {
        setIsTyping(true);
        setInvenIQState('thinking');
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsTyping(false);
        setInvenIQState('responding');
        setMessages(prev => [...prev, {
            id: Math.random().toString(),
            text,
            sender: 'inveniq',
            options,
            type
        }]);
        setTimeout(() => setInvenIQState('idle'), 1500);
    };

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: Math.random().toString(),
            text,
            sender: 'user'
        }]);
    };

    const triggerStep = async (s: number, data: FormData = formData) => {
        switch (s) {
            case 0:
                await addInvenIQMessage("Hi 👋 I'm InvenIQ\n\nI’ll help you set up your smart inventory dashboard in under 2 minutes.\n\nLet’s get started 🚀", [
                    { label: "Start Setup", value: "start" }
                ]);
                break;
            case 1:
                await addInvenIQMessage("First, what’s your full name?");
                break;
            case 2:
                await addInvenIQMessage(`Nice to meet you, ${data.name.split(' ')[0]} 😊\n\nWhat’s your email address?`);
                break;
            case 3:
                await addInvenIQMessage("Create a secure master password (at least 8 characters) 🔒");
                break;
            case 4:
                await addInvenIQMessage("What’s your organization or company name?");
                break;
            case 5:
                await addInvenIQMessage("Where is your business located?", [
                    { label: "Pakistan 🇵🇰", value: "Pakistan" },
                    { label: "UAE 🇦🇪", value: "United Arab Emirates" },
                    { label: "USA 🇺🇸", value: "United States" }
                ]);
                break;
            case 6:
                const currency = data.country === 'Pakistan' ? 'PKR' : data.country === 'United States' ? 'USD' : 'AED';
                setFormData((prev: FormData) => ({ ...prev, currency }));
                await addInvenIQMessage(`I’ll set your workspace currency to ${currency}. You can change this later.`);
                setStep(7);
                triggerStep(7, { ...data, currency });
                break;
            case 7:
                await addInvenIQMessage("Which best describes your inventory workflow?", [
                    { label: "Retail & E-comm 🛍️", value: "Retail" },
                    { label: "Wholesale & Dist 🚛", value: "Wholesale" },
                    { label: "Manufacturing 🏭", value: "Production" }
                ]);
                break;
            case 8:
                await addInvenIQMessage("To get your books ready, what's your primary business bank name? (e.g. Chase, HBL, Emirates NBD)");
                break;
            case 9:
                await addInvenIQMessage(`Got it, ${data.bank_name}. What's the last 4 digits or the account number? (This is for your internal reference only)`);
                break;
            case 10:
                await addInvenIQMessage("How should I configure your Chart of Accounts?", [
                    { label: "Standard (Recommended) 📚", value: "standard" },
                    { label: "Minimal (Start Fresh) ⚡", value: "minimal" }
                ]);
                break;
            case 11:
                await addInvenIQMessage("Perfect! Let’s confirm your workspace details:", undefined, 'summary');
                break;
            case 12:
                setIsCreating(true);
                await addInvenIQMessage("Awesome! Orchestrating your inventory environment...", undefined, 'loader');
                setTimeout(async () => {
                    submitRegistration();
                }, 2500);
                break;
        }
    };

    const handleSend = async (val?: string) => {
        const text = val || inputValue;
        if (!text && step !== 5 && step !== 7 && step !== 8) return;
        
        if (!val) setInputValue('');
        if (step > 0 && step !== 8) addUserMessage(text);

        switch (step) {
            case 0:
                setStep(1);
                triggerStep(1);
                break;
            case 1:
                setFormData((prev: FormData) => ({ ...prev, name: text }));
                setStep(2);
                triggerStep(2, { ...formData, name: text });
                break;
            case 2:
                if (!text.includes('@')) {
                    await addInvenIQMessage("Hmm, that doesn’t look like a valid email. Try again?");
                    return;
                }
                setFormData((prev: FormData) => ({ ...prev, email: text }));
                setStep(3);
                triggerStep(3);
                break;
            case 3:
                if (text.length < 8) {
                    await addInvenIQMessage("Make it a bit stronger (at least 8 characters)");
                    return;
                }
                setFormData((prev: FormData) => ({ ...prev, password: text }));
                setStep(4);
                triggerStep(4);
                break;
            case 4:
                setFormData((prev: FormData) => ({ ...prev, company_name: text }));
                await addInvenIQMessage("Great 👍");
                setStep(5);
                triggerStep(5);
                break;
            case 5:
                setFormData((prev: FormData) => ({ ...prev, country: text }));
                await addInvenIQMessage(`Got it — ${text}`);
                setStep(6);
                triggerStep(6, { ...formData, country: text, currency: '' });
                break;
            case 7:
                setFormData((prev: FormData) => ({ ...prev, industry: text }));
                await addInvenIQMessage("Perfect — I’ll enable smart tracking features for you.");
                setStep(8);
                triggerStep(8, { ...formData, industry: text });
                break;
            case 8:
                setFormData((prev: FormData) => ({ ...prev, bank_name: text }));
                setStep(9);
                triggerStep(9, { ...formData, bank_name: text });
                break;
            case 9:
                setFormData((prev: FormData) => ({ ...prev, account_number: text }));
                setStep(10);
                triggerStep(10, { ...formData, account_number: text });
                break;
            case 10:
                setFormData((prev: FormData) => ({ ...prev, coa_type: text as 'standard' | 'minimal' }));
                setStep(11);
                triggerStep(11, { ...formData, coa_type: text as 'standard' | 'minimal' });
                break;
            case 11:
                if (text === 'edit') {
                    setStep(1);
                    setMessages(prev => prev.filter(m => m.id === 'resume'));
                    addUserMessage("I want to edit some details.");
                    triggerStep(1);
                } else {
                    setStep(12);
                    triggerStep(12);
                }
                break;
        }
    };

    const submitRegistration = async () => {
        try {
            const response = await api.post("/register-company", {
                ...formData,
                company_email: formData.email
            });
            await addInvenIQMessage("🎉 Your smart workspace is ready!\n\nWelcome to InvenTrust 🚀", undefined, 'success');
            localStorage.removeItem('inveniq_v1_data');
            localStorage.removeItem('inveniq_v1_step');
            
            setTimeout(() => {
                onComplete(response.data);
            }, 2000);
        } catch (error: any) {
            setIsCreating(false);
            const msg = error.response?.data?.message || "Oops, something went wrong. Let’s try again. 😟";
            const details = error.response?.data?.data ? Object.values(error.response.data.data).flat().join(", ") : "";
            
            await addInvenIQMessage(`${msg}${details ? ": " + details : ""}`);
            setStep(8);
        }
    };

    const getPasswordStrength = () => {
        if (!formData.password) return 0;
        if (formData.password.length < 8) return 25;
        if (formData.password.length < 12) return 60;
        return 100;
    };

    return (
        <div className="flex flex-col h-[650px] w-full max-w-2xl bg-[#020617]/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex-1">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <InvenIQAvatar state={invenIQState} size="lg" className="h-14 w-14" />
                    <div>
                        <h3 className="text-white font-black text-xl tracking-tight">InvenIQ Assistant</h3>
                        <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Online Now</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onSwitchToManual} className="text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-xl font-bold">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Manual Form
                </Button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.sender === 'inveniq' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`flex gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''} max-w-[85%]`}>
                                {m.sender === 'inveniq' && (
                                    <InvenIQAvatar size="sm" state={invenIQState} className="shrink-0 mt-auto" />
                                )}
                                <div className="space-y-4">
                                    <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${
                                        m.sender === 'inveniq' 
                                            ? 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none shadow-xl' 
                                            : 'bg-primary text-white font-black shadow-2xl shadow-primary/30 rounded-br-none'
                                    }`}>
                                        <div className="whitespace-pre-line">{m.text}</div>
                                        
                                        {m.type === 'summary' && (
                                            <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                                                <div className="flex items-center gap-3 text-xs">
                                                    <User className="h-4 w-4 text-primary" />
                                                    <span className="text-slate-400">Name:</span>
                                                    <span className="text-white font-black">{formData.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    <span className="text-slate-400">Company:</span>
                                                    <span className="text-white font-black">{formData.company_name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <Globe2 className="h-4 w-4 text-primary" />
                                                    <span className="text-slate-400">Country:</span>
                                                    <span className="text-white font-black">{formData.country}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                    <span className="text-slate-400">Industry:</span>
                                                    <span className="text-white font-black">{formData.industry}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs border-t border-white/5 pt-2">
                                                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    </div>
                                                    <span className="text-slate-400">Bank:</span>
                                                    <span className="text-white font-black">{formData.bank_name || 'Skip'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {m.type === 'loader' && (
                                            <div className="mt-4 space-y-4">
                                                <div className="flex items-center justify-center h-12">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '100%' }}
                                                        transition={{ duration: 2.5 }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {m.options && !isCreating && (
                                        <div className="flex flex-wrap gap-2">
                                            {m.options.map((opt) => (
                                                <Button 
                                                    key={opt.value} 
                                                    variant="outline" 
                                                    onClick={() => handleSend(opt.value)}
                                                    className="bg-white/5 border-white/10 text-white hover:bg-primary hover:border-primary rounded-full px-6 h-11 font-black transition-all shadow-lg active:scale-95"
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {m.type === 'summary' && (
                                         <div className="flex gap-2">
                                            <Button 
                                                onClick={() => handleSend('confirm')}
                                                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 font-black shadow-xl shadow-primary/20"
                                            >
                                                Yes, Create My Workspace 🚀
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleSend('edit')}
                                                className="bg-white/5 border-white/10 text-white rounded-full px-8 h-12 font-black hover:bg-white/10"
                                            >
                                                Edit
                                            </Button>
                                         </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                             <div className="flex gap-4">
                                <InvenIQAvatar size="sm" state="thinking" className="shrink-0 mt-auto" />
                                <div className="bg-white/5 p-5 rounded-3xl rounded-bl-none flex gap-1.5 items-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-2">InvenIQ is typing</span>
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                                </div>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            {step > 0 && step < 11 && !isCreating && (
                <div className="p-8 bg-white/[0.01] border-t border-white/5 relative z-10 transition-all">
                    {step === 3 && (
                        <div className="mb-4 space-y-2 px-1">
                            <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                                <span>Password Strength</span>
                                <span>{getPasswordStrength() === 100 ? 'Secure 🔒' : 'Weak ⚠️'}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`h-full ${getPasswordStrength() > 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getPasswordStrength()}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-4"
                    >
                        <div className="relative flex-1 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors">
                                {step === 1 ? <User className="h-5 w-5" /> : 
                                 step === 2 ? <Mail className="h-5 w-5" /> :
                                 step === 3 ? <ShieldCheck className="h-5 w-5" /> :
                                 step === 4 ? <Building2 className="h-5 w-5" /> :
                                 <Sparkles className="h-5 w-5" />}
                            </div>
                            <Input 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onFocus={() => setInvenIQState('listening')}
                                onBlur={() => setInvenIQState('idle')}
                                placeholder={
                                    step === 1 ? "Enter your full name..." :
                                    step === 2 ? "Enter your work email..." :
                                    step === 3 ? "Pick a secure password..." :
                                    "Type your answer..."
                                }
                                type={step === 3 ? "password" : "text"}
                                className="h-16 pl-14 bg-white/5 border-white/10 text-white rounded-[1.5rem] focus:ring-primary/20 focus:border-primary transition-all font-medium text-base shadow-inner"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            size="icon" 
                            className="h-16 w-16 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] shrink-0 shadow-2xl shadow-primary/40 active:scale-95 transition-transform"
                        >
                            <Send className="h-6 w-6" />
                        </Button>
                    </form>
                    
                    {/* Progress Dots */}
                    <div className="mt-6 flex items-center justify-between px-2">
                        <div className="flex gap-1.5">
                            {[1,2,3,4,5,7,8,9,10,11].map(i => (
                                <div key={i} className={`h-1 w-4 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-white/10'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            Progress {Math.round((step / 11) * 100)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvenIQBot;
