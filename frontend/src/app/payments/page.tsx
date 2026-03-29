"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, ArrowUpRight, ArrowDownLeft, Calendar, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No payment records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((p) => (
                                        <TableRow key={p.id}>
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
                                            <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{p.party.name}</TableCell>
                                            <TableCell className={`font-black tabular-nums ${p.type === 'incoming' ? 'text-green-600' : 'text-rose-600'}`}>
                                                ${p.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="capitalize">{p.method}</TableCell>
                                            <TableCell className="text-muted-foreground">{p.reference || '-'}</TableCell>
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
                                        <SelectItem value="check">Check</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reference / Notes</label>
                                <Input placeholder="e.g. Check #1234, Bank confirmation" value={reference} onChange={e => setReference(e.target.value)} />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className={`w-full h-12 text-lg ${paymentType === 'incoming' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                    Record {paymentType === 'incoming' ? 'Incoming Receipt' : 'Outgoing Payment'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
