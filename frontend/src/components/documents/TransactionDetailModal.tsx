"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    FileText, 
    Receipt, 
    Calendar, 
    Hash, 
    Users, 
    ExternalLink, 
    ArrowRight, 
    Printer, 
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface TransactionDetailModalProps {
    type: 'invoice' | 'voucher';
    id: number | string | null;
    onClose: () => void;
    onActionComplete?: () => void;
}

export function TransactionDetailModal({ type, id, onClose, onActionComplete }: TransactionDetailModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const router = useRouter();
    const { can } = useAuth();

    useEffect(() => {
        if (id) {
            fetchDetails();
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            setData(null);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [id, type]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const endpoint = type === 'invoice' ? `/invoices/${id}` : `/vouchers/${id}`;
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${type} details:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !showRejectForm) {
            setShowRejectForm(true);
            return;
        }

        setIsActionLoading(true);
        try {
            const endpoint = type === 'invoice' 
                ? `/invoices/${id}/${action}` 
                : `/vouchers/${id}/${action}`;
            
            const payload = action === 'reject' ? { reason: rejectionReason } : {};
            const response = await api.post(endpoint, payload);
            
            toast.success(response.data.message || `${type.charAt(0).toUpperCase() + type.slice(1)} ${action}d successfully`);
            
            setShowRejectForm(false);
            setRejectionReason("");
            
            if (onActionComplete) {
                onActionComplete();
            }
            fetchDetails();
        } catch (error: any) {
            console.error(`Failed to ${action} ${type}:`, error);
            toast.error(error.response?.data?.error || `Failed to ${action} ${type}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!id) return null;

    const canApprove = type === 'invoice' ? can('approve_invoices') : can('approve_vouchers');
    const isPending = data?.status === 'pending';

    const formatCurrency = (amount: number, currency: string = 'PKR') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-3 w-3" />;
            case 'rejected': return <XCircle className="h-3 w-3" />;
            case 'pending': return <Clock className="h-3 w-3" />;
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            {id && (
                <div className="fixed inset-0 z-[100] outline-none focus:outline-none">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
                    />

                    {/* Scrollable Container */}
                    <div className="fixed inset-0 overflow-y-auto no-scrollbar py-8 sm:py-12 px-4 pointer-events-none">
                        <div className="flex min-h-full items-start justify-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <Clock className="h-8 w-8 animate-spin text-primary opacity-20" />
                                <p className="text-sm text-muted-foreground font-medium">Loading details...</p>
                            </div>
                        ) : data ? (
                            <>
                                {/* Modal Header */}
                                <div className={`p-8 pb-6 flex items-start justify-between ${
                                    type === 'voucher' ? 'bg-emerald-500/5' : 'bg-primary/5'
                                }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${
                                            type === 'voucher' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                        }`}>
                                            {type === 'voucher' ? <Receipt className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">
                                                {data.invoice_number || data.voucher_number}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                    type === 'voucher' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                                }`}>
                                                    {type === 'voucher' ? 'Voucher' : 'Invoice'}
                                                </span>
                                                {data.status && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(data.status)}`}>
                                                        {getStatusIcon(data.status)}
                                                        {data.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="p-8 pt-6 space-y-6">
                                    {/* Amount Section */}
                                    <div className="flex flex-col items-center justify-center py-6 border-y border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Amount</span>
                                        <span className={`text-4xl font-black tracking-tighter ${
                                            type === 'voucher' ? 'text-emerald-500' : 'text-foreground'
                                        }`}>
                                            {formatCurrency(data.total_amount || data.amount, data.currency || 'PKR')}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-border bg-card">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Date</span>
                                            </div>
                                            <p className="font-bold text-foreground">{data.date}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-border bg-card">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                <Hash className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Reference</span>
                                            </div>
                                            <p className="font-bold text-foreground">
                                                #{ (data.invoice_number || data.voucher_number || '').split('-')[1] || data.id }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Client/Vendor Info */}
                                    <div className="p-4 rounded-2xl border border-border bg-card">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Users className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                {type === 'invoice' ? 'Client' : (data.client ? 'Client' : 'Vendor')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-xl text-foreground">
                                                {data.client?.company_name || data.vendor?.company_name || 'System Entity'}
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    if (data.client_id) router.push(`/ledger/${data.client_id}`);
                                                    else if (data.vendor_id) router.push(`/vendors/${data.vendor_id}`);
                                                    onClose();
                                                }}
                                                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {data.status === 'rejected' && data.rejection_reason && (
                                        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                                            <div className="flex items-center gap-2 text-rose-500 mb-2">
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Rejection Reason</span>
                                            </div>
                                            <p className="text-sm text-rose-600 font-medium leading-relaxed italic">
                                                "{data.rejection_reason}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 pt-2">
                                        {isPending && canApprove && (
                                            <>
                                                {showRejectForm ? (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-3 mb-3 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20"
                                                    >
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">Reason for Rejection</label>
                                                        <textarea 
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            className="w-full p-3 rounded-xl border border-rose-500/20 bg-white dark:bg-zinc-900 text-sm focus:ring-1 focus:ring-rose-500 outline-none min-h-[100px]"
                                                            placeholder="Please explain why this is being rejected..."
                                                        />
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    setShowRejectForm(false);
                                                                    setRejectionReason("");
                                                                }}
                                                                className="flex-1 py-3 rounded-xl font-bold bg-zinc-200 dark:bg-zinc-800 text-foreground text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction('reject')}
                                                                disabled={isActionLoading || !rejectionReason.trim()}
                                                                className="flex-[2] py-3 rounded-xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/20 text-sm disabled:opacity-50"
                                                            >
                                                                Confirm Rejection
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3 mb-1">
                                                        <button 
                                                            onClick={() => handleAction('reject')}
                                                            disabled={isActionLoading}
                                                            className="py-4 rounded-2xl font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                            Reject
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction('approve')}
                                                            disabled={isActionLoading}
                                                            className="py-4 rounded-2xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                            Approve
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={onClose}
                                                className="flex-1 py-4 rounded-2xl font-bold bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/${type}s/${data.id}/print`, '_blank')}
                                                className="flex-[2] py-4 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Printer className="h-5 w-5" />
                                                Print {type === 'invoice' ? 'Invoice' : 'Voucher'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-20 text-center text-muted-foreground">
                                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Failed to load details.</p>
                                <Button variant="ghost" className="mt-4" onClick={onClose}>Close</Button>
                            </div>
                        )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
