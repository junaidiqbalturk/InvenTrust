"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Plus, 
    Search, 
    ChevronRight, 
    ChevronDown, 
    ShieldCheck, 
    MoreVertical, 
    Edit, 
    Trash2, 
    Wand2, 
    FolderTree,
    Info,
    LayoutGrid,
    ListTree
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

interface Account {
    id: number;
    name: string;
    code: string;
    type: AccountType;
    parent_id: number | null;
    description?: string;
    is_system: boolean;
    all_children?: Account[];
    children?: Account[];
}

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
    
    // Form State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "expense" as AccountType,
        parent_id: "none",
        code: "",
        description: "",
        auto_code: true
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/accounts");
            setAccounts(data.data || []);
        } catch (error) {
            toast.error("Failed to load Chart of Accounts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                parent_id: formData.parent_id === "none" ? null : Number(formData.parent_id)
            };
            await api.post("/accounts", payload);
            toast.success("Account added to ledger");
            setIsAddModalOpen(false);
            fetchAccounts();
            setFormData({ name: "", type: "expense", parent_id: "none", code: "", description: "", auto_code: true });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create account");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteAccount = async (id: number) => {
        if (!confirm("Are you sure? This will also delete all sub-accounts.")) return;
        try {
            await api.delete(`/accounts/${id}`);
            toast.success("Account removed");
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    // Recommended code logic helper
    useEffect(() => {
        if (formData.auto_code && !formData.code) {
            const ranges: Record<string, string> = {
                asset: "1000",
                liability: "2000",
                equity: "3000",
                income: "4000",
                expense: "5000"
            };
            // Since we don't know the exact max on client, we just show a placeholder
            // The backend will handle the actual generation
        }
    }, [formData.type, formData.auto_code]);

    const AccountTreeItem = ({ account, level = 0 }: { account: Account, level?: number }) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const children = account.all_children || account.children || [];
        const hasChildren = children.length > 0;

        return (
            <div className="select-none">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                        "group flex items-center gap-3 p-3 rounded-2xl hover:bg-accent/50 transition-all border border-transparent hover:border-border/50 mb-1",
                        level === 0 ? "bg-accent/10" : ""
                    )}
                >
                    <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />
                        ) : (
                            <div className="w-4" />
                        )}
                    </div>

                    <div className="h-8 w-10 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary tabular-nums">
                        {account.code}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-200">{account.name}</span>
                            {account.is_system && (
                                <Badge variant="outline" className="text-[8px] h-4 bg-primary/10 text-primary border-primary/20 flex gap-1 items-center font-black">
                                    <ShieldCheck className="h-2 w-2" /> CORE
                                </Badge>
                            )}
                            {level === 0 && (
                                <Badge className={cn(
                                    "text-[8px] h-4 font-black uppercase tracking-widest",
                                    account.type === 'asset' ? 'bg-blue-500/20 text-blue-400' :
                                    account.type === 'expense' ? 'bg-rose-500/20 text-rose-400' :
                                    'bg-slate-500/20 text-slate-400'
                                )}>
                                    {account.type}
                                </Badge>
                            )}
                        </div>
                        {account.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{account.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary">
                            <Edit className="h-3 w-3" />
                        </Button>
                        {!account.is_system && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteAccount(account.id)}
                                className="h-8 w-8 hover:bg-rose-500/20 hover:text-rose-500"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    parent_id: account.id.toString(), 
                                    type: account.type as AccountType 
                                }));
                                setIsAddModalOpen(true);
                            }}
                            className="h-8 w-8 hover:bg-emerald-500/20 hover:text-emerald-500"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </motion.div>

                {isExpanded && hasChildren && (
                    <div className="ml-6 border-l border-border/20 pl-4 pb-2 mt-1">
                        {children.map(child => (
                            <AccountTreeItem key={child.id} account={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <FolderTree className="h-10 w-10 text-primary" />
                        Chart of Accounts
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Configure your financial foundation and account hierarchy.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-muted p-1 rounded-xl flex gap-1 border border-border">
                        <Button 
                            variant={viewMode === 'tree' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('tree')}
                            className="h-8"
                        >
                            <ListTree className="h-4 w-4 mr-2" /> Tree
                        </Button>
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('grid')}
                            className="h-8"
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                        </Button>
                    </div>
                    
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger 
                            render={
                                <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 group">
                                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                                    Add Account
                                </Button>
                            }
                        />
                        <DialogContent className="bg-[#020617] border-white/10 text-white max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">New Ledger Account</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAccount} className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Account Name</label>
                                        <Input 
                                            placeholder="e.g. Sales Revenue, Office Rent" 
                                            value={formData.name || ""}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Type</label>
                                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: (v as AccountType) ?? "expense" })}>
                                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    <SelectItem value="asset">Asset</SelectItem>
                                                    <SelectItem value="liability">Liability</SelectItem>
                                                    <SelectItem value="equity">Equity</SelectItem>
                                                    <SelectItem value="income">Income</SelectItem>
                                                    <SelectItem value="expense">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Parent (Optional)</label>
                                            <Select value={formData.parent_id} onValueChange={v => setFormData({ ...formData, parent_id: v ?? "none" })}>
                                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white max-h-64">
                                                    <SelectItem value="none">None (Root)</SelectItem>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Account Code</label>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, auto_code: !formData.auto_code, code: "" })}
                                                className={cn(
                                                    "text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-lg transition-all",
                                                    formData.auto_code ? "text-primary bg-primary/10" : "text-slate-500 bg-white/5"
                                                )}
                                            >
                                                <Wand2 className="h-3 w-3" />
                                                {formData.auto_code ? "Recommended" : "Manual"}
                                            </button>
                                        </div>
                                        <Input 
                                            placeholder={formData.auto_code ? "Auto-generated upon save" : "Enter custom code"} 
                                            disabled={formData.auto_code}
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                            required={!formData.auto_code}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Description</label>
                                        <Input 
                                            placeholder="What is this account used for?" 
                                            value={formData.description || ""}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : "Save Account"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Assets", range: "1000s", color: "text-blue-400" },
                    { label: "Liabilities", range: "2000s", color: "text-rose-400" },
                    { label: "Income", range: "4000s", color: "text-emerald-400" },
                    { label: "Expenses", range: "5000s", color: "text-amber-400" },
                ].map((stat, i) => (
                    <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">{stat.label}</p>
                            <p className={cn("text-lg font-black", stat.color)}>{stat.range}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <Card className="bg-card dark:bg-slate-900/50 backdrop-blur-3xl border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
                <CardHeader className="border-b border-border/5 bg-muted/30 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Ledger</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium mt-1">Hierarchical view of all ledger accounts.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search accounts..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 bg-muted/50 border-border h-11 rounded-xl focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4 opacity-50">
                            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse">Syncing Ledger...</p>
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
                            <div className="h-20 w-20 rounded-3xl bg-slate-500/10 flex items-center justify-center border border-white/5">
                                <ListTree className="h-10 w-10 text-slate-500 opacity-20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-300">No accounts found</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Your Chart of Accounts is empty. Start by adding your first financial header.</p>
                            </div>
                            <Button onClick={() => setIsAddModalOpen(true)} variant="secondary" className="font-bold">
                                Create Initial Ledger
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {accounts.map(acc => (
                                <AccountTreeItem key={acc.id} account={acc} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Hint Box */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex gap-6 items-start">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Info className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-black text-primary uppercase text-xs tracking-widest">Accounting Tip</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Proper account categorization ensures accurate **Balance Sheets** and **Profit & Loss** reports. 
                        Use sub-accounts for detailed tracking (e.g. create "Travel" and "Utilities" under "Expenses").
                    </p>
                </div>
            </div>
        </div>
    );
}
