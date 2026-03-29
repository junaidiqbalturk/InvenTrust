"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Activity, ArrowRight, Building2, UserCircle, Globe2, Wallet, CheckCircle2, ShieldCheck, Sparkles, Loader2, Languages, PackageSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/components/providers/TranslationProvider";

const formSchema = z.object({
    // Admin Info
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid personal email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // Company Info
    company_name: z.string().min(2, "Workspace name must be at least 2 characters"),
    country: z.string().min(2, "Country is required"),
    currency: z.string().min(3).max(3),
    industry: z.string().min(1, "Please select an industry"),
});

import InvenIQBot from "@/components/marketing/InvenIQBot";

type Step = 1 | 2 | 3;
type OnboardingMode = 'form' | 'inveniq' | null;

export default function RegisterCompanyPage() {
    const { login } = useAuth();
    const { t, setLanguage } = useTranslation();
    const [step, setStep] = useState<Step>(1);
    const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [setupProgress, setSetupProgress] = useState(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { 
            name: "", 
            email: "", 
            password: "",
            company_name: "", 
            country: "United States", 
            currency: "USD",
            industry: "Both"
        },
    });

    // IP Detection for localized registration
    useEffect(() => {
        const detectLocation = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            try {
                const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                const data = await response.json();
                clearTimeout(timeoutId);

                if (data.country_name) {
                    form.setValue('country', data.country_name);
                }
                if (data.currency) {
                    form.setValue('currency', data.currency);
                }
                // Map country to language if not manually set
                if (data.country_code === 'ES') setLanguage('es');
                if (data.country_code === 'FR') setLanguage('fr');
            } catch (error: any) {
                // Fail silently for network errors (ad-blockers, offline, etc)
                if (error.name !== 'AbortError') {
                    console.debug("Location detection skipped:", error.message);
                }
            }
        };
        detectLocation();
    }, [form, setLanguage]);

    // Success animation progress
    useEffect(() => {
        if (step === 3) {
            const timer = setInterval(() => {
                setSetupProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(timer);
        }
    }, [step]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorMsg("");
        setIsLoading(true);
        try {
            const { data } = await api.post("/register-company", {
                ...values,
                company_email: values.email // Default business email to user email for simplicity
            });
            
            // Move to success animation step
            setStep(3);
            
            // Wait for animation to finish before login
            setTimeout(() => {
                login(data.token, data.user);
            }, 3500);
            
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Workspace creation failed. Please try again.");
            setIsLoading(false);
            setStep(2); // Go back to fix company info
        }
    }

    const nextStep = async () => {
        const fields = step === 1 ? ["name", "email", "password"] : ["company_name", "country", "currency", "industry"];
        const isValid = await form.trigger(fields as any);
        if (isValid) setStep(prev => (prev + 1) as Step);
    };

    const handleInvenIQComplete = (data: any) => {
        setStep(3);
        setTimeout(() => {
            login(data.token, data.user);
        }, 3500);
    };

    return (
        <div className="min-h-screen w-full flex bg-[#020617] selection:bg-primary/30 overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-600/10 blur-[150px]"></div>
            </div>

            <div className="w-full flex">
                {/* Left Side: Brand Story */}
                <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10 border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl">
                    <div className="space-y-6">
                        <Logo size="lg" className="mb-6" />

                        <div className="pt-12 space-y-4">
                            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                                Orchestrate Your <br />
                                <span className="text-primary">Inventory Intelligence</span>
                            </h1>
                            <p className="text-slate-400 text-xl max-w-md leading-relaxed">
                                {t('welcome')}
                            </p>
                        </div>

                        <div className="pt-8 space-y-6">
                            {[
                                { icon: PackageSearch, title: "Smart Stock Tracking", desc: "Real-time visibility across all warehouses." },
                                { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your data is isolated and encrypted." },
                                { icon: CheckCircle2, title: "Zero Configuration", desc: "Start managing stock in less than 2 minutes." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors group cursor-default"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{item.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="text-slate-500 text-sm flex items-center gap-6">
                        <span>Trusted by 500+ efficient warehouses</span>
                        <div className="h-4 w-px bg-white/10" />
                        <span>GDPR Compliant</span>
                    </div>
                </div>

                {/* Right Side: Onboarding Flow */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {!onboardingMode && step < 3 && (
                            <motion.div 
                                key="choice-screen"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-2xl grid md:grid-cols-2 gap-8"
                            >
                                <div className="col-span-full text-center mb-8">
                                    <h2 className="text-4xl font-black text-white mb-4">How would you like to begin?</h2>
                                    <p className="text-slate-400">Choose the path that fits your workflow best.</p>
                                </div>
                                
                                <button 
                                    onClick={() => setOnboardingMode('inveniq')}
                                    className="group relative p-8 rounded-[2.5rem] bg-[#020617]/60 backdrop-blur-3xl border border-white/5 hover:border-primary/50 transition-all text-left flex flex-col justify-between h-[340px] shadow-2xl overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Sparkles className="h-32 w-32 text-primary" />
                                    </div>
                                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 mb-6">
                                        <Activity className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-3">AI-Guided Setup</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                            Chat with **InvenIQ**, our intelligent concierge, to get your workspace ready through a natural conversation.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-primary font-bold text-sm mt-6">
                                        Start with InvenIQ <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setOnboardingMode('form')}
                                    className="group relative p-8 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-3xl border border-white/5 hover:border-white/20 transition-all text-left flex flex-col justify-between h-[340px] shadow-2xl"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 mb-6">
                                        <Building2 className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-3">Manual Configuration</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                            Prefer the classic way? Fill out our high-speed, step-by-step form to configure your tenant manually.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-white/60 font-bold text-sm mt-6 group-hover:text-white transition-colors">
                                        Open Step Form <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {onboardingMode === 'inveniq' && step < 3 && (
                            <motion.div 
                                key="inveniq-bot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-2xl"
                            >
                                <InvenIQBot 
                                    onComplete={handleInvenIQComplete} 
                                    onSwitchToManual={() => setOnboardingMode('form')} 
                                />
                            </motion.div>
                        )}

                        {onboardingMode === 'form' && step < 3 && (
                            <motion.div
                                key="standard-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-md"
                            >
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setOnboardingMode('inveniq')} 
                                    className="mb-6 text-xs text-primary font-bold hover:bg-primary/10 tracking-widest uppercase"
                                >
                                    <Sparkles className="h-3 w-3 mr-2" />
                                    Try AI-Guided Setup instead
                                </Button>

                                <div className="flex justify-between mb-10 px-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => i < step && setStep(i as Step)}>
                                            <div className={`h-1.5 w-16 lg:w-32 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
                                            <span className={`text-[10px] uppercase tracking-widest font-bold ${step === i ? 'text-primary' : 'text-slate-500'}`}>
                                                {i === 1 ? t('personalInfo') : t('workspaceInfo')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#020617]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="form-step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-8"
                                            >
                                                <div className="text-center">
                                                    <h2 className="text-3xl font-black text-white">{t('personalInfo')}</h2>
                                                    <p className="text-slate-400 mt-2">Create your master administrator account</p>
                                                </div>

                                                <Form {...form}>
                                                    <form className="space-y-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Full Name</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                                            <Input className="h-12 pl-11 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="E.g. Alexander Hamilton" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Work Email</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                                            <Input type="email" className="h-12 pl-11 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="alex@company.com" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="password"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Master Password</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                                            <Input type="password" className="h-12 pl-11 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="••••••••" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <div className="flex gap-1 mt-2">
                                                                        {[1, 2, 3, 4].map((i) => (
                                                                            <div key={i} className={`h-1 flex-1 rounded-full ${field.value.length > i * 2 ? 'bg-primary' : 'bg-white/5'}`} />
                                                                        ))}
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <Button 
                                                            type="button" 
                                                            onClick={nextStep}
                                                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-2xl font-black text-lg group"
                                                        >
                                                            Continue
                                                            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </Button>

                                                        <p className="text-center text-slate-500 text-sm">
                                                            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                                                        </p>
                                                    </form>
                                                </Form>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="form-step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-8"
                                            >
                                                <div className="text-center">
                                                    <h2 className="text-3xl font-black text-white">Create Workspace</h2>
                                                    <p className="text-slate-400 mt-2">Isolated data for your organization</p>
                                                </div>

                                                {errorMsg && (
                                                    <div className="p-4 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                                        {errorMsg}
                                                    </div>
                                                )}

                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                                        <FormField
                                                            control={form.control}
                                                            name="company_name"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Company Name</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                                            <Input className="h-12 pl-11 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20 transition-all font-medium" placeholder="E.g. Inventory Masters Inc." {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name="country"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Country</FormLabel>
                                                                        <FormControl>
                                                                            <Input className="h-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="currency"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2">
                                                                        <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">BCY</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-2xl">
                                                                                    <SelectValue placeholder="USD" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="bg-[#020617] border-white/10 text-white">
                                                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                                                <SelectItem value="PKR">PKR (₨)</SelectItem>
                                                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name="industry"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-slate-400 text-xs ml-1 uppercase tracking-widest font-bold">Industry Focus</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-2xl">
                                                                                <SelectValue placeholder="Select industry" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-[#020617] border-white/10 text-white">
                                                                            <SelectItem value="Retail">Retail & E-commerce</SelectItem>
                                                                            <SelectItem value="Wholesale">Wholesale & Distribution</SelectItem>
                                                                            <SelectItem value="Production">Manufacturing & Production</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="pt-4 flex flex-col gap-4">
                                                            <Button 
                                                                type="submit" 
                                                                disabled={isLoading}
                                                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-2xl font-black text-lg group"
                                                            >
                                                                {isLoading ? (
                                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-white/80" />
                                                                ) : (
                                                                    <span className="flex items-center justify-center">
                                                                        Create My Workspace
                                                                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                                    </span>
                                                                )}
                                                            </Button>
                                                            <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-white hover:bg-white/5 font-bold">
                                                                Wait, go back
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </Form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="success-step"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <div className="h-28 w-28 rounded-[2.5rem] bg-primary/20 flex items-center justify-center border border-primary/30 relative z-10">
                                        <Sparkles className="h-14 w-14 text-primary animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 h-28 w-28 rounded-[2.5rem] border border-primary/20 animate-[spin_10s_linear_infinite]" />
                                    <div className="absolute inset-0 h-28 w-28 rounded-[2.5rem] border border-primary/10 animate-[spin_15s_linear_infinite_reverse]" />
                                </div>
                                
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Your Workspace is Ready!</h2>
                                    <p className="text-slate-400 font-medium">Setting up your secure environment...</p>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-500 px-1">
                                        <span>Deploying Database</span>
                                        <span>{setupProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${setupProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                                        Initialization: {setupProgress < 30 ? "Configuring Tables" : setupProgress < 70 ? "Seeding Demo Data" : "Finalizing Assets"}
                                    </p>
                                </div>

                                <div className="pt-4 flex items-center gap-2 text-primary font-bold">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting you to dashboard...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
