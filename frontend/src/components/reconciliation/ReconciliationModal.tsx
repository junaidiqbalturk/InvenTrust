"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Receipt, 
    FileText, 
    ArrowRight, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    ChevronRight,
    Calculator,
    History,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import api from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";

interface Invoice {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: string;
    date: string;
    balance?: number; // Calculated field
}

interface ReconciliationModalProps {
    voucher: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReconciliationModal({ voucher, onClose, onSuccess }: ReconciliationModalProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allocations, setAllocations] = useState<Record<number, string>>({});

    useEffect(() => {
        if (voucher) {
            fetchOutstandingInvoices();
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [voucher]);

    const fetchOutstandingInvoices = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/reconciliation/outstanding-invoices?client_id=${voucher.client_id}`);
            // We'll need to check if the backend returns the actual balance or we need to fetch it.
            // For now, we'll assume total_amount is the balance if it's 'approved'/'unpaid'.
            setInvoices(data);
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
            toast.error("Failed to load outstanding invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleAllocationChange = (invoiceId: number, value: string) => {
        // Prevent typing non-numeric characters (except dot)
        if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
        
        setAllocations(prev => ({
            ...prev,
            [invoiceId]: value
        }));
    };

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const remainingToAllocate = (voucher?.amount || 0) - totalAllocated;
    const isOverAllocated = remainingToAllocate < -0.01;

    const autoAllocate = () => {
        let remaining = voucher.amount;
        const newAllocations: Record<number, string> = {};

        // Sort by date oldest first
        const sortedInvoices = [...invoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const inv of sortedInvoices) {
            if (remaining <= 0) break;
            const amountToApply = Math.min(remaining, inv.total_amount); // Simplified balance assumption
            newAllocations[inv.id] = amountToApply.toFixed(2);
            remaining -= amountToApply;
        }

        setAllocations(newAllocations);
        toast.info("Auto-allocation applied oldest-first.");
    };

    const handleSubmit = async () => {
        if (totalAllocated <= 0) {
            toast.error("Please allocate some amount first");
            return;
        }

        if (isOverAllocated) {
            toast.error("Total allocation exceeds voucher amount");
            return;
        }

        setIsSubmitting(true);
        try {
            const matches = Object.entries(allocations)
                .filter(([_, amount]) => parseFloat(amount) > 0)
                .map(([id, amount]) => ({
                    invoice_id: parseInt(id),
                    amount: parseFloat(amount)
                }));

            await api.post('/reconciliation/match', {
                voucher_id: voucher.id,
                matches
            });

            toast.success("Reconciliation completed successfully");
            onSuccess();
        } catch (error: any) {
            console.error("Reconciliation failed:", error);
            toast.error(error.response?.data?.error || "Failed to reconcile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(amount || 0);
    };

    if (!voucher) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[95vw] lg:max-w-4xl max-h-[95vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-border bg-card shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 sm:p-8 border-b border-border bg-muted/30 relative">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 sm:gap-5">
                                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 shrink-0">
                                    <History className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight truncate">Invoice Reconciliation</h2>
                                    <p className="text-muted-foreground font-medium flex items-center gap-2 mt-0.5 sm:mt-1 text-xs sm:text-base">
                                        <Receipt className="h-3 w-3 sm:h-4 sm:w-4" /> 
                                        <span className="truncate">Matching Voucher <span className="text-foreground font-bold">{voucher.voucher_number}</span></span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground shadow-sm bg-background border border-border shrink-0"
                            >
                                <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background border border-border shadow-sm">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Voucher Amount</span>
                                <div className="text-sm sm:text-xl font-bold text-foreground">{formatCurrency(voucher.amount)}</div>
                            </div>
                            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border shadow-sm transition-colors ${
                                isOverAllocated ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest block mb-1 ${
                                    isOverAllocated ? 'text-rose-500' : 'text-emerald-500'
                                }`}>Remaining</span>
                                <div className={`text-sm sm:text-xl font-bold ${
                                    isOverAllocated ? 'text-rose-600' : 'text-emerald-600'
                                }`}>
                                    {formatCurrency(remainingToAllocate)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                                <Button 
                                    onClick={autoAllocate}
                                    className="flex-1 h-10 sm:h-full rounded-xl sm:rounded-2xl font-bold bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:scale-[1.02] transition-transform flex items-center gap-2 text-xs sm:text-sm"
                                >
                                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 fill-amber-400" />
                                    Auto-Match
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => setAllocations({})}
                                    className="h-10 sm:h-full rounded-xl sm:rounded-2xl font-bold border-border hover:bg-rose-500/5 hover:text-rose-500 transition-colors text-xs sm:text-sm"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-4 sm:pt-6">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Clock className="h-10 w-10 animate-spin opacity-20" />
                                <p className="font-bold tracking-tight uppercase text-xs">Loading Outstanding Invoices...</p>
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold">No Outstanding Invoices</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">This client doesn't have any unpaid or partially paid invoices waiting for reconciliation.</p>
                                <Button variant="outline" onClick={onClose} className="rounded-xl px-8 font-bold">Close</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Outstanding Bills</span>
                                </div>

                                 <div className="rounded-2xl sm:rounded-3xl border border-border overflow-x-auto bg-background no-scrollbar">
                                    <div className="min-w-[600px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                                                    <TableHead className="font-black h-12 sm:h-14 uppercase text-[9px] sm:text-[10px] tracking-widest pl-4 sm:pl-6">Invoice</TableHead>
                                                    <TableHead className="font-black h-12 sm:h-14 uppercase text-[9px] sm:text-[10px] tracking-widest">Date</TableHead>
                                                    <TableHead className="font-black h-12 sm:h-14 uppercase text-[9px] sm:text-[10px] tracking-widest text-right">Total Amount</TableHead>
                                                    <TableHead className="font-black h-12 sm:h-14 uppercase text-[9px] sm:text-[10px] tracking-widest text-right pr-4 sm:pr-6">Allocation</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {invoices.map((inv) => (
                                                    <TableRow key={inv.id} className="group transition-colors h-16 sm:h-20">
                                                        <TableCell className="pl-4 sm:pl-6">
                                                            <div className="font-bold text-sm sm:text-base text-foreground">{inv.invoice_number}</div>
                                                            <div className="text-[9px] sm:text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Ref #{inv.id}</div>
                                                        </TableCell>
                                                        <TableCell className="text-xs sm:text-sm font-medium text-muted-foreground/80">
                                                            {inv.date}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="font-bold text-sm sm:text-base text-foreground">{formatCurrency(inv.total_amount)}</div>
                                                            <div className="text-[9px] sm:text-[10px] uppercase font-black text-rose-500/80 tracking-widest">Outstanding</div>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-4 sm:pr-6 w-36 sm:w-48">
                                                            <div className="relative group/input">
                                                                <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground font-bold pointer-events-none">Rs.</div>
                                                                <Input 
                                                                    value={allocations[inv.id] || ""}
                                                                    onChange={(e) => handleAllocationChange(inv.id, e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="h-10 sm:h-12 pl-8 sm:pl-10 pr-3 sm:pr-4 bg-zinc-50 dark:bg-zinc-900 border-border group-hover/input:border-primary/50 transition-colors text-right font-black text-sm sm:text-lg focus:ring-primary/20 rounded-lg sm:rounded-xl"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 sm:p-8 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                            <p className="text-xs sm:text-sm font-medium">Reconciling <span className="text-foreground font-bold">{Object.keys(allocations).length}</span> invoices</p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <Button 
                                variant="ghost" 
                                onClick={onClose}
                                className="px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold h-12 sm:h-14 flex-1 sm:flex-none text-xs sm:text-base"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || totalAllocated <= 0 || isOverAllocated}
                                className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 flex-1 sm:flex-none transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                )}
                                <span className="whitespace-nowrap">Complete Reconciliation</span>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
