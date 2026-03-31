"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    History,
    Filter,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface LedgerEntry {
    id: number;
    date: string;
    description: string;
    debit: number;
    credit: number;
    running_balance: number;
    party?: {
        name: string;
    };
    referenceable?: {
        invoice_no?: string;
        purchase_no?: string;
        id: number;
    };
}

interface AccountData {
    account: {
        name: string;
        code: string;
        type: string;
    };
    entries: LedgerEntry[];
    summary: {
        total_debit: number;
        total_credit: number;
        closing_balance: number;
    };
}

function LedgerAuditContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const accountCode = searchParams.get("account") || "1300";
    
    const [data, setData] = useState<AccountData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLedger();
    }, [accountCode]);

    const fetchLedger = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/accounts/${accountCode}/ledger`);
            setData(response.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load account ledger");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const filteredEntries = (data?.entries || []).filter(e => 
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.party?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.referenceable?.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.referenceable?.purchase_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground animate-pulse font-medium">Analyzing transaction history...</p>
            </div>
        );
    }

    if (!data) return (
        <div className="p-8 text-center space-y-4">
            <h2 className="text-xl font-bold">Account Not Found</h2>
            <p className="text-muted-foreground">The requested account code {accountCode} could not be located.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{data.account.name} Audit</h1>
                            <Badge variant="secondary" className="font-mono">{data.account.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                             Full Transaction History Analysis
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchLedger} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Account Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-2 right-2 p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                        <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Total Debits (+)</CardDescription>
                        <CardTitle className="text-2xl font-black font-outfit">{formatCurrency(data.summary.total_debit)}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-rose-500/5 border-rose-500/20 shadow-sm overflow-hidden relative">
                    <div className="absolute top-2 right-2 p-2 rounded-full bg-rose-500/10 text-rose-500">
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-rose-600 font-bold uppercase text-[10px] tracking-widest">Total Credits (-)</CardDescription>
                        <CardTitle className="text-2xl font-black font-outfit">{formatCurrency(data.summary.total_credit)}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-primary/5 border-primary/20 shadow-md overflow-hidden relative ring-1 ring-primary/20">
                    <div className="absolute top-2 right-2 p-2 rounded-full bg-primary/10 text-primary">
                        <History className="h-4 w-4" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary font-bold uppercase text-[10px] tracking-widest">Running Balance</CardDescription>
                        <CardTitle className="text-2xl font-black font-outfit">{formatCurrency(data.summary.closing_balance)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Analysis Table */}
            <Card className="shadow-xl border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary text-white">
                                <Filter className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>Transaction Ledger</CardTitle>
                                <CardDescription>Detailed audit of every movement affecting this account.</CardDescription>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search transactions, customers, IDs..." 
                                className="pl-9 bg-background focus-visible:ring-primary shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow>
                                <TableHead className="font-bold w-[120px]">Date</TableHead>
                                <TableHead className="font-bold">Description & Reference</TableHead>
                                <TableHead className="text-right font-bold">Debit (+)</TableHead>
                                <TableHead className="text-right font-bold">Credit (-)</TableHead>
                                <TableHead className="text-right font-bold bg-muted/30">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEntries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors group">
                                    <TableCell className="font-medium font-mono text-xs">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm leading-none">{entry.description}</p>
                                            <div className="flex items-center gap-2">
                                                {entry.party && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 flex items-center gap-1">
                                                        <Search className="h-2 w-2" />
                                                        {entry.party.name}
                                                    </Badge>
                                                )}
                                                {entry.referenceable && (
                                                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                                        <FileText className="h-2 w-2" />
                                                        {entry.referenceable.invoice_no || entry.referenceable.purchase_no || `#${entry.referenceable.id}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        {entry.debit > 0 ? (
                                            <span className="text-emerald-600 font-bold">+{formatCurrency(entry.debit)}</span>
                                        ) : (
                                            <span className="text-muted-foreground/30">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        {entry.credit > 0 ? (
                                            <span className="text-rose-600 font-bold">-{formatCurrency(entry.credit)}</span>
                                        ) : (
                                            <span className="text-muted-foreground/30">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right py-4 font-black bg-muted/10 group-hover:bg-muted/30 transition-colors">
                                        {formatCurrency(entry.running_balance)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredEntries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <History className="h-12 w-12 opacity-20" />
                                            <p className="font-medium italic">No transactions found match your search criteria.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Reconciliation Insights */}
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-blue-700">
                    <History className="h-5 w-5" />
                    Audit Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800/80">
                    <p>
                        This audit trace shows every entry recorded for Account <strong>{data.account.name}</strong>. 
                        If the <strong>Total Debits</strong> is significantly lower than your physical valuation, 
                        initial stock or manual adjustments may not have been posted to the General Ledger.
                    </p>
                    <p>
                        Review transactions marked with <span className="font-bold underline text-rose-700">negative balances</span> or large 
                        credits without matching debits. Discrepancies in perpetual inventory often occur whenSales are recorded 
                        without a corresponding Cost of Goods Sold adjustment.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LedgerAudit() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LedgerAuditContent />
        </Suspense>
    );
}
