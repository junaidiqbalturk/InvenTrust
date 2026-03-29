"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, ArrowUpRight, ArrowDownLeft, Calendar, Loader2, Eye, Edit, Trash2, FileText, Download, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Payment {
    id: number;
    date: string;
    amount: number;
    method: string;
    type: 'incoming' | 'outgoing';
    reference: string;
    party: { name: string };
}

interface Party {
    id: number;
    name: string;
    type: string;
    current_balance: number;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // View/Edit/Delete states
    const [viewPayment, setViewPayment] = useState<Payment | null>(null);
    const [editPayment, setEditPayment] = useState<Payment | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Form states
    const [selectedParty, setSelectedParty] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState("cash");
    const [paymentType, setPaymentType] = useState<"incoming" | "outgoing">("incoming");
    const [reference, setReference] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payRes, partyRes] = await Promise.all([
                api.get("/payments"),
                api.get("/parties")
            ]);
            setPayments(payRes.data);
            setParties(partyRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (id: number) => {
        try {
            setIsDownloading(true);
            const response = await api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-PAY-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to download receipt");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpdatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPayment) return;
        try {
            await api.put(`/payments/${editPayment.id}`, {
                date: editPayment.date,
                method: editPayment.method,
                reference: editPayment.reference,
            });
            toast.success("Payment updated successfully");
            setEditPayment(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to update payment");
        }
    };

    const handleDeletePayment = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/payments/${deleteId}`);
            toast.success("Payment deleted and balance reversed");
            setDeleteId(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to delete payment");
        }
    };

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParty || amount <= 0) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            await api.post("/payments", {
                party_id: selectedParty,
                date: paymentDate,
                amount,
                method,
                type: paymentType,
                reference
            });
            toast.success("Payment recorded successfully");
            setIsCreateModalOpen(false);
            fetchData();
            // Reset form
            setSelectedParty("");
            setAmount(0);
            setReference("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record payment");
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Record and track all cash and bank transactions.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Record Payment
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Party</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No payment records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((p) => (
                                        <TableRow key={p.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    p.type === 'incoming' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {p.type === 'incoming' ? <ArrowDownLeft className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                                                    {p.type}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{new Date(p.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold">{p.party.name}</TableCell>
                                            <TableCell className={`font-black tabular-nums ${p.type === 'incoming' ? 'text-green-600' : 'text-rose-600'}`}>
                                            ${Number(p.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                <Badge variant="outline" className="font-bold border-muted-foreground/20">
                                                    {p.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-[150px]">{p.reference || '-'}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewPayment(p)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setEditPayment({...p})}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setDeleteId(p.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

            {/* Record Payment Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record New Payment</DialogTitle>
                        <DialogDescription>Record cash or bank payment from/to a party.</DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={paymentType} onValueChange={(val: any) => setPaymentType(val)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="incoming" className="data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
                                <ArrowDownLeft className="h-4 w-4 mr-2" /> Incoming
                            </TabsTrigger>
                            <TabsTrigger value="outgoing" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all">
                                <ArrowUpRight className="h-4 w-4 mr-2" /> Outgoing
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{paymentType === 'incoming' ? 'From Customer' : 'To Supplier'}</label>
                                <Select value={selectedParty} onValueChange={(val) => val && setSelectedParty(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Party" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.filter(p => paymentType === 'incoming' ? p.type === 'customer' : p.type === 'supplier').map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name} (Bal: ${p.current_balance})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount</label>
                                    <Input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                    <Select value={method} onValueChange={(val) => val && setMethod(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Reference / Notes</Label>
                                    <Input placeholder="e.g. Check #1234, Bank confirmation" value={reference} onChange={e => setReference(e.target.value)} />
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button type="submit" className={`w-full h-12 text-lg font-bold ${paymentType === 'incoming' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                        Record {paymentType === 'incoming' ? 'Incoming Receipt' : 'Outgoing Payment'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                {/* View Payment Modal */}
                <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Payment Details
                            </DialogTitle>
                        </DialogHeader>
                        {viewPayment && (
                            <div className="space-y-6 pt-4">
                                <div className="bg-muted/50 p-6 rounded-2xl border text-center space-y-2">
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Transaction Amount</div>
                                    <div className={`text-4xl font-black ${viewPayment.type === 'incoming' ? 'text-green-600' : 'text-rose-600'}`}>
                                        ${Number(viewPayment.amount).toFixed(2)}
                                    </div>
                                    <Badge variant="outline" className="font-bold uppercase tracking-wider">
                                        {viewPayment.method}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 px-2">
                                    <div>
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</Label>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-sm font-bold text-green-600">
                                            <CheckCircle2 className="h-4 w-4" /> Verified
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date</Label>
                                        <div className="mt-0.5 text-sm font-bold">{new Date(viewPayment.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{viewPayment.type === 'incoming' ? 'Received From' : 'Paid To'}</Label>
                                        <div className="mt-0.5 text-sm font-bold">{viewPayment.party.name}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Reference</Label>
                                        <div className="mt-0.5 text-sm font-medium text-muted-foreground">{viewPayment.reference || 'No reference provided'}</div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full h-12 gap-2 font-bold" 
                                    onClick={() => handleDownloadReceipt(viewPayment.id)}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Download Modern Receipt (PDF)
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Payment Modal */}
                <Dialog open={!!editPayment} onOpenChange={() => setEditPayment(null)}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Edit className="h-5 w-5 text-primary" />
                                Edit Payment
                            </DialogTitle>
                        </DialogHeader>
                        {editPayment && (
                            <form onSubmit={handleUpdatePayment} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground">Date</Label>
                                    <Input type="date" value={editPayment.date} onChange={e => setEditPayment({...editPayment, date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground">Method</Label>
                                    <Select value={editPayment.method} onValueChange={(val) => val && setEditPayment({...editPayment, method: val})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground">Reference</Label>
                                    <Input value={editPayment.reference || ''} onChange={e => setEditPayment({...editPayment, reference: e.target.value})} />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full h-12 font-bold bg-primary hover:bg-primary/90">
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent className="max-w-sm rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Reverse Payment?
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-center space-y-3">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                This will permanently delete the payment record and <strong>reverse its impact</strong> on the ledger and party balance.
                            </p>
                            <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-bold border border-rose-100 italic">
                                Note: This action cannot be undone.
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" className="flex-1 font-bold h-11" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" className="flex-1 font-bold h-11 bg-rose-600 hover:bg-rose-700" onClick={handleDeletePayment}>Yes, Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
