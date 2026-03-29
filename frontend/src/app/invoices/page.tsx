"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ReceiptText, Printer, Search, Filter, FileText, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { TransactionDetailModal } from "@/components/documents/TransactionDetailModal";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Invoice {
    id: number;
    invoice_number: string;
    client: { company_name: string };
    date: string;
    currency: string;
    total_amount: number;
    status: 'pending' | 'approved' | 'rejected';
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [viewId, setViewId] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setViewId(parseInt(viewParam));
            setIsViewOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get("/invoices");
            setInvoices(response.data);
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        let reason = null;
        if (action === 'reject') {
            reason = prompt("Reason for rejection:");
            if (reason === null) return;
        }

        try {
            const response = await api.post(`/invoices/${id}/${action}`, { reason });
            toast.success(response.data.message || `Invoice ${action}d successfully`);
            fetchInvoices();
        } catch (error: any) {
            toast.error(error.response?.data?.error || `Failed to ${action} invoice`);
        }
    };

    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));
    };

    const filteredInvoices = invoices.filter((invoice) => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            invoice.invoice_number?.toLowerCase().includes(lowerQuery) ||
            invoice.client?.company_name?.toLowerCase().includes(lowerQuery) ||
            invoice.date?.toLowerCase().includes(lowerQuery) ||
            invoice.currency?.toLowerCase().includes(lowerQuery) ||
            invoice.total_amount?.toString().includes(lowerQuery)
        );
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Issue and manage client invoices.</p>
                </div>
                <Link href="/invoices/create">
                    <Button className="shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Button>
                </Link>
            </div>

            {pendingInvoices.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Pending Approvals</h2>
                            <p className="text-sm text-muted-foreground">Invoices awaiting review before posting to Ledger.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {pendingInvoices.map((invoice) => (
                                <motion.div
                                    key={invoice.id}
                                    layout
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono text-xs text-muted-foreground">{invoice.invoice_number}</span>
                                        <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase">Pending</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm line-clamp-1">
                                            {invoice.client?.company_name || 'Generic Client'}
                                        </p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(invoice.total_amount, invoice.currency)}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 font-bold h-9"
                                            onClick={() => { setViewId(invoice.id); setIsViewOpen(true); }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9"
                                            onClick={() => handleAction(invoice.id, 'approve')}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                        <ReceiptText className="h-5 w-5 text-muted-foreground" />
                        <span>All Invoices</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 h-9 rounded-md bg-background" />
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex h-9">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground">Loading invoices...</TableCell>
                            </TableRow>
                        ) : filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors group">
                                <TableCell className="font-medium text-foreground">{invoice.invoice_number}</TableCell>
                                <TableCell className="text-foreground">{invoice.client?.company_name}</TableCell>
                                <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                <TableCell className="text-right font-bold text-foreground">
                                    {formatCurrency(invoice.total_amount, invoice.currency)}
                                </TableCell>
                                <TableCell className="text-right pr-5">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setViewId(invoice.id); setIsViewOpen(true); }} className="h-8 text-xs font-semibold text-primary hover:bg-primary/10">
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(invoice); setIsDocOpen(true); }} className="h-8 text-xs font-semibold text-primary hover:bg-primary/10">
                                            <FileText className="h-3.5 w-3.5 mr-1" />
                                            Docs
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')} title="Print Invoice">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && filteredInvoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-12 text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                            <Search className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium">No invoices found matching your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDocOpen} onOpenChange={setIsDocOpen}>
                <DialogContent className="max-w-4xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            <FileText className="h-6 w-6 text-primary" />
                            Invoice Documents
                        </DialogTitle>
                        <DialogDescription>
                            Manage attached files for Invoice #{selectedInvoice?.invoice_number}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedInvoice && (
                        <div className="mt-4">
                            <DocumentSection documentableType="App\Models\Invoice" documentableId={selectedInvoice.id} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <TransactionDetailModal 
                type="invoice" 
                id={viewId} 
                onClose={() => {
                    setIsViewOpen(false);
                    setViewId(null);
                    // Remove view param from URL
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('view');
                    router.replace(`/invoices?${params.toString()}`);
                }}
                onActionComplete={fetchInvoices}
            />
        </div>
    );
}

