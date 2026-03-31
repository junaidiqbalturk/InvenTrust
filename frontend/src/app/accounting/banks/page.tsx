"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Plus, 
    Search, 
    Building2, 
    CreditCard, 
    Link2, 
    Trash2, 
    RefreshCcw, 
    ArrowUpRight, 
    ShieldCheck, 
    Wallet,
    Info,
    MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    iban: string | null;
    currency: string;
    balance: number;
    ledger_account_id: number;
}

export default function BankManagementPage() {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        bank_name: "",
        account_number: "",
        iban: "",
        currency: "USD",
        opening_balance: 0
    });

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/banks");
            setBanks(data.data || []);
        } catch (error) {
            toast.error("Failed to load bank accounts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post("/banks", formData);
            toast.success("Bank account and ledger synced");
            setIsAddModalOpen(false);
            fetchBanks();
            setFormData({ bank_name: "", account_number: "", iban: "", currency: "USD", opening_balance: 0 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add bank");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteBank = async (id: number) => {
        if (!confirm("Are you sure? This will also remove the linked ledger account if it has no transactions.")) return;
        try {
            await api.delete(`/banks/${id}`);
            toast.success("Bank account removed");
            fetchBanks();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Building2 className="h-10 w-10 text-primary" />
                        Bank Accounts
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your physical accounts and monitor real-time ledger balances.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={fetchBanks}
                        className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                        <RefreshCcw className={cn("h-5 w-5 text-slate-400", isLoading && "animate-spin")} />
                    </Button>
                    
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger 
                            render={
                                <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 group">
                                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                                    Add Bank
                                </Button>
                            }
                        />
                        <DialogContent className="bg-[#020617] border-white/10 text-white max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Register New Bank</DialogTitle>
                                <CardDescription className="text-primary font-bold">A corresponding ledger account will be created automatically.</CardDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddBank} className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Bank Name</label>
                                        <Input 
                                            placeholder="e.g. JPMorgan Chase, HBL, Barclays" 
                                            value={formData.bank_name}
                                            onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Account Number</label>
                                            <Input 
                                                placeholder="0000 1234 5678" 
                                                value={formData.account_number}
                                                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                                                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Currency</label>
                                            <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v ?? "USD" })}>
                                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    <SelectItem value="USD">USD - Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="GBP">GBP - Pound</SelectItem>
                                                    <SelectItem value="PKR">PKR - Rupee</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">IBAN / SWIFT (Optional)</label>
                                        <Input 
                                            placeholder="PK00 BANK 0012 3456 ..." 
                                            value={formData.iban}
                                            onChange={e => setFormData({ ...formData, iban: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Opening Balance</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</div>
                                            <Input 
                                                type="number"
                                                placeholder="0.00" 
                                                value={formData.opening_balance}
                                                onChange={e => setFormData({ ...formData, opening_balance: Number(e.target.value) })}
                                                className="bg-white/5 border-white/10 h-12 pl-8 rounded-xl focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Linking..." : "Complete Integration"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))
                ) : banks.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] text-center space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-white/5 mx-auto flex items-center justify-center">
                            <Wallet className="h-8 w-8 text-slate-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-300">No banks integrated</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Link your first business bank account to enable reconciled payments.</p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(true)} className="font-bold">
                            Get Started
                        </Button>
                    </div>
                ) : (
                    banks.map((bank) => (
                        <motion.div 
                            key={bank.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="group relative overflow-hidden"
                        >
                            <Card className="bg-[#020617]/50 backdrop-blur-3xl border-white/10 group-hover:border-primary/30 transition-all rounded-[2rem] overflow-hidden shadow-xl">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
                                            <Building2 className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{bank.bank_name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <CreditCard className="h-3 w-3 text-slate-500" />
                                                <p className="text-[10px] text-slate-500 font-black tabular-nums">
                                                    **** {bank.account_number.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10" onClick={() => deleteBank(bank.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Available Balance</p>
                                            <h2 className="text-3xl font-black text-white flex items-baseline gap-2 mt-1">
                                                <span className="text-primary text-xl font-bold">{bank.currency}</span>
                                                {bank.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </h2>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                            <div className="flex items-center gap-2">
                                                <Link2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Sync</span>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black">
                                                ID: ACC-{bank.ledger_account_id}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Hint Box */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex gap-6 items-start">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Info className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-black text-primary uppercase text-xs tracking-widest">ERP Integration Note</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        These are the physical bank accounts your business uses. Every transaction recorded here will reflect in your **Financial Ledger** automatically. 
                        Deletion is restricted if the ledger contains historical transactions for audit safety.
                    </p>
                </div>
            </div>
        </div>
    );
}
