"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LoginPage() {
    const { login } = useAuth();
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorMsg("");
        setIsLoading(true);
        try {
            const { data } = await api.post("/login", values);
            login(data.token, data.user);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Login failed");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617] selection:bg-[#059669]/30">
            {/* Background SVG / Gradient Effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Base Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#061F1A] via-[#020617] to-[#020617]"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#059669]/20 blur-[120px] mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0D9488]/10 blur-[150px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '12s' }}></div>

                {/* Grid Overlay for Formal Tech Feel */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[440px] p-6 relative z-10">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    className="bg-[#020617]/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden"
                >
                    {/* Inner highlight for glassmorphism */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <motion.div variants={fadeUp} className="flex flex-col items-center mb-10 relative z-10">
                        <Logo size="xl" showText={true} className="gap-5" textClassName="text-4xl" />
                        <p className="text-slate-400 text-sm font-medium mt-4">
                            Secure access to your enterprise portal
                        </p>
                    </motion.div>

                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 text-sm font-medium text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 flex items-start gap-3 relative z-10"
                        >
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            {errorMsg}
                        </motion.div>
                    )}

                    <div className="relative z-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <motion.div variants={fadeUp}>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-slate-300 font-medium text-sm ml-1">Work Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="h-12 bg-[#020617]/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981]/50 focus-visible:border-[#10B981]/50 transition-all rounded-xl shadow-inner"
                                                        placeholder="admin@InvenTrust.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400 text-xs ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-2">
                                                <div className="flex items-center justify-between ml-1">
                                                    <FormLabel className="text-slate-300 font-medium text-sm">Password</FormLabel>
                                                    <Link href="#" className="text-xs text-[#10B981] hover:text-[#34D399] transition-colors tracking-wide">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        className="h-12 bg-[#020617]/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#10B981]/50 focus-visible:border-[#10B981]/50 transition-all rounded-xl shadow-inner"
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400 text-xs ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-[#059669] hover:bg-[#10B981] text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 transition-all duration-200 rounded-xl font-medium text-base group"
                                    >
                                        {isLoading ? (
                                            <Activity className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </div>

                    <motion.div variants={fadeUp} className="mt-8 text-center relative z-10 pt-6 border-t border-white/10 space-y-3">
                        <p className="text-slate-400 text-sm">
                            New here?{" "}
                            <Link href="/register-company" className="font-semibold text-[#10B981] hover:text-[#34D399] transition-colors">
                                Register your Company
                            </Link>
                        </p>
                        <p className="text-slate-500 text-xs text-center">
                            Already part of a team? Request access from your admin.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Footer attribution or extra info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-center mt-6 text-slate-500 text-xs font-medium tracking-wide uppercase"
                >
                    &copy; {new Date().getFullYear()} InvenTrust Technologies
                </motion.div>
            </div>
        </div>
    );
}

