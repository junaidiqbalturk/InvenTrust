"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search, User, ArrowUpRight, ArrowDownLeft, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LedgerEntry {
    id: number;
    date: string;
    type: 'debit' | 'credit';
    amount: number;
    running_balance: number;
    description: string;
    referenceable_type: string;
    referenceable_id: number;
}

interface Party {
    id: number;
    name: string;
    type: string;
    current_balance: number;
}

export default function LedgerPage() {
    const [parties, setParties] = useState<Party[]>([]);
    const [selectedPartyId, setSelectedPartyId] = useState<string>("");
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [partiesLoading, setPartiesLoading] = useState(true);

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            setPartiesLoading(true);
            const { data } = await api.get("/parties");
            setParties(data);
        } catch (error) {
            toast.error("Failed to load parties");
        } finally {
            setPartiesLoading(false);
        }
    };

    const fetchLedger = async (partyId: string) => {
        if (!partyId) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/ledger/${partyId}`);
            setLedger(data.data); // Paginated response
        } catch (error) {
            toast.error("Failed to load ledger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPartyId) {
            fetchLedger(selectedPartyId);
        }
    }, [selectedPartyId]);

    const selectedParty = parties.find(p => p.id.toString() === selectedPartyId);

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ledger System</h1>
                    <p className="text-muted-foreground">Track financial history and running balances for all parties.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 max-w-md">
                <div className="flex-1">
                    <Select value={selectedPartyId} onValueChange={(val) => val && setSelectedPartyId(val)}>
                        <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Select Customer/Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                            {parties.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name} ({p.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedPartyId ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Party Name</div>
                                <div className="text-2xl font-bold mt-1">{selectedParty?.name}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Type</div>
                                <div className="text-2xl font-bold mt-1 capitalize">{selectedParty?.type}</div>
                            </CardContent>
                        </Card>
                        <Card className={selectedParty?.current_balance && selectedParty.current_balance < 0 ? "bg-rose-50 border-rose-200" : "bg-green-50 border-green-200"}>
                            <CardContent className="pt-6">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Balance</div>
                                <div className={`text-3xl font-black mt-1 ${selectedParty?.current_balance && selectedParty.current_balance < 0 ? "text-rose-600" : "text-green-600"}`}>
                                    ${selectedParty?.current_balance?.toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>All debits, credits, and the running balance.</CardDescription>
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
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                            <TableHead className="text-right font-bold">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledger.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                    No ledger entries found for this party.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ledger.map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            {entry.description}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-rose-600 tabular-nums">
                                                        {entry.type === 'debit' ? `$${entry.amount.toFixed(2)}` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-green-600 tabular-nums">
                                                        {entry.type === 'credit' ? `$${entry.amount.toFixed(2)}` : '-'}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-black tabular-nums ${entry.running_balance < 0 ? 'text-rose-700' : 'text-green-700'}`}>
                                                        ${entry.running_balance.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="border-dashed h-64 flex flex-col items-center justify-center text-center p-12">
                    <Book className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-medium text-muted-foreground">Select a party to view their ledger</h3>
                    <p className="text-sm text-muted-foreground/60 max-w-xs mt-2">Choose a customer or supplier from the dropdown above to see their full transaction history.</p>
                </Card>
            )}
        </div>
    );
}
