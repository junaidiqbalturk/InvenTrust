"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    PieChart, 
    Loader2,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface TrialBalanceAccount {
    account_id: number;
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
}

interface TrialBalanceData {
    period: { start: string | null; end: string };
    data: TrialBalanceAccount[];
    totals: {
        debit: number;
        credit: number;
    };
}

export default function TrialBalance() {
    const [data, setData] = useState<TrialBalanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/reports/trial-balance");
            setData(response.data);
        } catch (error) {
            toast.error("Failed to load Trial Balance");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAccounts = data?.data.filter(acc => 
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        acc.code.includes(searchTerm)
    ) || [];

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Trial Balance</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            As of {new Date(data.period.end).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Trial Balance Table */}
            <Card className="shadow-xl border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <PieChart className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle>Unified Ledger Check</CardTitle>
                                <CardDescription>Verification of sum of debits and sum of credits for all accounts.</CardDescription>
                            </div>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter by code or name..." 
                                className="pl-9 bg-background focus-visible:ring-amber-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="uppercase font-bold text-[10px] tracking-widest">
                            <TableHead className="w-24">Code</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts.map((acc) => (
                            <TableRow key={acc.account_id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="py-4 font-mono font-bold text-amber-700">{acc.code}</TableCell>
                                <TableCell className="py-4 font-medium">{acc.name}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter">
                                        {acc.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4 font-bold tabular-nums">
                                    {acc.debit > 0 ? formatCurrency(acc.debit) : "—"}
                                </TableCell>
                                <TableCell className="text-right py-4 font-bold tabular-nums">
                                    {acc.credit > 0 ? formatCurrency(acc.credit) : "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="bg-[#1C2434] text-white p-6">
                    <div className="flex justify-end gap-16 md:gap-32">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Debits</p>
                            <p className="text-2xl font-black font-outfit">{formatCurrency(data.totals.debit)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Credits</p>
                            <p className="text-2xl font-black font-outfit">{formatCurrency(data.totals.credit)}</p>
                        </div>
                    </div>
                    {Math.abs(data.totals.debit - data.totals.credit) < 0.01 && (
                        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-xs font-bold text-emerald-400 italic">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            General Ledger is perfectly in balance.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
