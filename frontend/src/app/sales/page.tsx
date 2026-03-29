"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Receipt, User, Calendar, DollarSign, Trash2, Loader2, Minus, PlusCircle, Percent, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionDetailModal } from "@/components/documents/TransactionDetailModal";
import { ContactFormModal } from "@/components/contacts/ContactFormModal";

interface Invoice {
    id: number;
    invoice_no: string;
    party: { name: string };
    date: string;
    final_amount: number;
    paid_amount: number;
    due_amount: number;
    status: string;
}

interface Product {
    id: number;
    name: string;
    sale_price: number;
    stock_quantity: number;
}

interface Party {
    id: number;
    name: string;
    type: string;
}

export default function SalesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form states
    const [selectedParty, setSelectedParty] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [items, setItems] = useState<{product_id: string, quantity: number, unit_price: number}[]>([]);

    // Payment Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
    const [quickPaymentAmount, setQuickPaymentAmount] = useState(0);
    const [quickPaymentMethod, setQuickPaymentMethod] = useState("cash");
    const [quickPaymentDate, setQuickPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // View Modal states
    const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Quick Add Contact Modal
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invRes, prodRes, partyRes] = await Promise.all([
                api.get("/invoices"),
                api.get("/products"),
                api.get("/parties?type=customer")
            ]);
            setInvoices(invRes.data);
            setProducts(prodRes.data);
            setParties(partyRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === "product_id") {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                newItems[index].unit_price = product.sale_price;
            }
        }
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - discount + tax;
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error("Add at least one item");
            return;
        }

        try {
            await api.post("/invoices", {
                party_id: selectedParty,
                date: invoiceDate,
                discount,
                tax,
                paid_amount: paidAmount,
                items
            });
            toast.success("Invoice created successfully");
            setIsCreateModalOpen(false);
            fetchData();
            // Reset form
            setItems([]);
            setSelectedParty("");
            setDiscount(0);
            setTax(0);
            setPaidAmount(0);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create invoice");
        }
    };

    const handleQuickPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoiceForPayment || quickPaymentAmount <= 0) return;

        try {
            setIsSubmittingPayment(true);
            await api.post(`/invoices/${selectedInvoiceForPayment.id}/pay`, {
                amount: quickPaymentAmount,
                method: quickPaymentMethod,
                date: quickPaymentDate,
            });
            toast.success("Payment recorded successfully");
            setIsPaymentModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales & Invoicing</h1>
                    <p className="text-muted-foreground">Manage your sales, create invoices, and track payments.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Invoice
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono font-bold">{inv.invoice_no}</TableCell>
                                            <TableCell>{inv.party.name}</TableCell>
                                            <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold">${Number(inv.final_amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-green-600">${Number(inv.paid_amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-rose-600 font-bold">${Number(inv.due_amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                    inv.status === 'partial' ? 'bg-amber-100 text-amber-700' : 
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                        onClick={() => {
                                                            setViewInvoiceId(inv.id);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {Number(inv.due_amount) > 0 && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 text-xs font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => {
                                                                setSelectedInvoiceForPayment(inv);
                                                                setQuickPaymentAmount(Number(inv.due_amount));
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                        >
                                                            <DollarSign className="h-3 w-3 mr-1" /> Pay
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Invoice Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-5xl w-full max-h-[96vh] rounded-3xl overflow-hidden p-0 border-none shadow-2xl flex flex-col">
                    <div className="bg-primary/5 p-8 border-b border-primary/10 flex-shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight">Create Sale Invoice</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium">Issue a new professional invoice for your client.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleCreateInvoice} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar min-h-0">
                            {/* Header Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end bg-card p-6 rounded-2xl border border-muted/30 shadow-sm">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" /> Customer
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select value={selectedParty} onValueChange={(val) => val && setSelectedParty(val)}>
                                            <SelectTrigger className="h-11 rounded-xl border-muted-foreground/20 focus:ring-primary/20 flex-1 overflow-hidden">
                                                <SelectValue placeholder="Select a customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parties.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-11 w-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5 shrink-0"
                                            onClick={() => setIsQuickAddModalOpen(true)}
                                            title="Add New Customer"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-primary" /> Invoice Date
                                    </Label>
                                    <Input type="date" className="h-11 rounded-xl border-muted-foreground/20 w-full" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 hidden lg:block">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        Invoice Status
                                    </Label>
                                    <div className="h-11 flex items-center px-4 bg-primary/5 text-primary font-bold rounded-xl border border-primary/10 tracking-wide uppercase text-[10px]">
                                        DRAFT INVOICE
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                        Invoice Items
                                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-bold">{items.length} Items</span>
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-full px-4 border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all h-9">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>
                                <div className="rounded-2xl border border-muted/30 overflow-hidden shadow-sm bg-card">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-1/2 font-black text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Product Details</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Quantity</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Unit Price</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Subtotal</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-muted/5 transition-colors border-muted/20 last:border-none">
                                                    <TableCell className="py-4 px-6">
                                                        <Select value={item.product_id} onValueChange={(val) => val && updateItem(index, "product_id", val)}>
                                                            <SelectTrigger className="border-none bg-transparent hover:bg-muted/20 transition-all font-bold p-0 h-auto focus:ring-0 w-full text-left truncate">
                                                                <SelectValue placeholder="Search or Select Product..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.name} <span className="opacity-50 font-normal ml-2">(Stock: {p.stock_quantity})</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Input type="number" className="h-9 w-24 rounded-lg bg-muted/10 border-transparent focus:bg-white transition-all font-bold" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} />
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-1 font-bold">
                                                            <span className="text-muted-foreground font-black text-xs">$</span>
                                                            <Input type="number" className="h-9 w-28 rounded-lg bg-muted/10 border-transparent focus:bg-white transition-all font-bold" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value))} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 font-black text-primary">
                                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6">
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-full h-8 w-8 transition-colors">
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {items.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic font-medium">
                                                        Click "Add Item" to start building this invoice.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Summary & Totals */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-4">
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="bg-card p-6 rounded-2xl border border-muted/30 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Adjustments & Notes</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Discount Value</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input type="number" className="pl-10 h-11 rounded-xl" value={discount} onChange={e => setDiscount(parseFloat(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Sales Tax (GST/VAT)</Label>
                                                <div className="relative">
                                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input type="number" className="pl-10 h-11 rounded-xl" value={tax} onChange={e => setTax(parseFloat(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Invoice Note (Optional)</Label>
                                            <textarea 
                                                className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                                                placeholder="Terms, bank details or personal message..."
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Payment Received</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                            <Input type="number" className="pl-11 h-12 rounded-xl text-xl font-black bg-white border-emerald-500/20 text-emerald-600 focus:ring-emerald-500/20 shadow-sm" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 h-full">
                                    <div className="bg-[#1C2434] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center space-y-6 border border-white/5 relative overflow-hidden group min-h-[340px]">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                            <Receipt size={100} />
                                        </div>
                                        <div className="space-y-5 relative z-10 w-full">
                                            <div className="flex justify-between items-center text-white/50">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                                <span className="font-bold tracking-tight">${calculateSubtotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-rose-400">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Total Discount</span>
                                                <span className="font-bold tracking-tight">-${discount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sky-400">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Tax Inclusion</span>
                                                <span className="font-bold tracking-tight">+${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="h-px bg-white/10 my-4" />
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-black uppercase tracking-widest text-primary mt-1">Grand Total</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-5xl font-black tracking-tighter text-primary truncate max-w-full">${calculateTotal().toFixed(2)}</span>
                                                    <span className="text-[10px] text-white/40 mt-1 italic tracking-wide lowercase">inclusive of all charges</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 text-sm text-white/80">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Remaining Due</span>
                                                <span className={`font-black px-4 py-1.5 rounded-xl text-base ${calculateTotal() - paidAmount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'}`}>
                                                    ${(calculateTotal() - paidAmount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-muted/20 backdrop-blur-sm flex-shrink-0">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="hidden md:flex items-center gap-3 text-muted-foreground italic font-medium">
                                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                                    <p className="text-[10px] tracking-tight">Financial ledger will be automatically balanced on finalization.</p>
                                </div>
                                <Button type="submit" className="w-full sm:w-auto h-14 px-16 text-lg font-black tracking-tight rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white">
                                    Generate & Finalize Invoice
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Record Invoice Payment
                        </DialogTitle>
                        <DialogDescription>
                            Enter payment details for invoice <strong>{selectedInvoiceForPayment?.invoice_no}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleQuickPayment} className="space-y-5 pt-4">
                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 mb-2">
                            <div className="flex justify-between items-center text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                                <span>Remaining Due</span>
                                <span>$ {Number(selectedInvoiceForPayment?.due_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Amount to Pay</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        className="pl-9 h-11 font-bold text-lg" 
                                        value={quickPaymentAmount} 
                                        onChange={e => setQuickPaymentAmount(parseFloat(e.target.value))} 
                                        max={selectedInvoiceForPayment?.due_amount}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Payment Date</Label>
                                    <Input type="date" className="h-11" value={quickPaymentDate} onChange={e => setQuickPaymentDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Method</Label>
                                    <Select value={quickPaymentMethod} onValueChange={(val) => val && setQuickPaymentMethod(val)}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmittingPayment} className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700">
                                {isSubmittingPayment ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
                                    </>
                                ) : (
                                    "Confirm Payment"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <TransactionDetailModal 
                type="invoice" 
                id={viewInvoiceId} 
                onClose={() => {
                    setViewInvoiceId(null);
                    setIsViewModalOpen(false);
                }} 
                onActionComplete={fetchData}
            />

            <ContactFormModal 
                isOpen={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                initialType="customer"
                onSuccess={(newParty) => {
                    fetchData();
                    setSelectedParty(newParty.id.toString());
                }}
            />
        </div>
    );
}
