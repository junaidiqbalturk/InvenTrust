"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Search, 
    ArrowRightLeft,
    Check,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BankAccount {
    id: number;
    name: string;
    code: string;
}

interface BankTransaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    is_reconciled: boolean;
    ledger_entry?: any;
}

interface Match {
    ledger_entry: any;
    score: number;
    match_type: 'exact' | 'partial' | 'low';
}

export default function ReconcilePage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [statements, setStatements] = useState<any[]>([]);
    const [selectedStatement, setSelectedStatement] = useState<any>(null);
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);

    useEffect(() => {
        fetchAccounts();
        fetchStatements();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await api.get('/accounts');
            // Filter only Cash/Bank (Assets)
            setAccounts(data.filter((a: any) => a.type === 'asset' && (a.code.startsWith('1001') || a.code.startsWith('1002'))));
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        }
    };

    const fetchStatements = async () => {
        try {
            const { data } = await api.get('/reconciliation');
            setStatements(data);
        } catch (error) {
            console.error("Failed to fetch statements", error);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedAccountId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account_id', selectedAccountId);

        try {
            const { data } = await api.post('/reconciliation/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Bank statement uploaded successfully");
            setStatements([data, ...statements]);
            setFile(null);
            loadStatement(data.id);
        } catch (error) {
            toast.error("Failed to upload statement");
        } finally {
            setIsUploading(false);
        }
    };

    const loadStatement = async (id: number) => {
        try {
            const { data } = await api.get(`/reconciliation/statements/${id}`);
            setSelectedStatement(data.statement);
            setTransactions(data.transactions);
            setSelectedTransaction(null);
            setMatches([]);
        } catch (error) {
            toast.error("Failed to load transactions");
        }
    };

    const findMatches = async (transaction: BankTransaction) => {
        setSelectedTransaction(transaction);
        setIsLoadingMatches(true);
        try {
            const { data } = await api.get(`/reconciliation/transactions/${transaction.id}/matches`);
            setMatches(data);
        } catch (error) {
            toast.error("Failed to fetch matches");
        } finally {
            setIsLoadingMatches(false);
        }
    };

    const reconcile = async (ledgerEntryId: number) => {
        if (!selectedTransaction) return;

        try {
            await api.post(`/reconciliation/transactions/${selectedTransaction.id}/reconcile`, {
                ledger_entry_id: ledgerEntryId
            });
            toast.success("Transaction reconciled!");
            
            // Update local state
            setTransactions(transactions.map(t => 
                t.id === selectedTransaction.id 
                    ? { ...t, is_reconciled: true, ledger_entry_id: ledgerEntryId } 
                    : t
            ));
            setSelectedTransaction(null);
            setMatches([]);
        } catch (error) {
            toast.error("Reconciliation failed");
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[#1C2434] tracking-tight">Bank Reconciliation</h1>
                    <p className="text-[#64748B]">Match your bank statements with InvenIQ records</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Panel: Upload & Statements */}
                <div className="space-y-6">
                    <Card className="border-2 border-zinc-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Upload Statement</CardTitle>
                            <CardDescription>Select a bank account and upload CSV</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFileUpload} className="space-y-4">
                                <Select value={selectedAccountId || ""} onValueChange={(val) => setSelectedAccountId(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Bank Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept=".csv,.txt" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="space-y-2">
                                        <Upload className="w-8 h-8 mx-auto text-zinc-400" />
                                        <p className="text-sm text-zinc-500">{file ? file.name : "Drag or drop CSV statement"}</p>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full" 
                                    disabled={!file || !selectedAccountId || isUploading}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Process Statement
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-zinc-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Uploads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {statements.map(stmt => (
                                    <button 
                                        key={stmt.id}
                                        onClick={() => loadStatement(stmt.id)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center",
                                            selectedStatement?.id === stmt.id ? "bg-primary/5 border-primary text-primary" : "border-zinc-100 hover:bg-zinc-50"
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate">{stmt.filename}</p>
                                            <p className="text-xs opacity-70">{stmt.upload_date}</p>
                                        </div>
                                        <FileText className="w-4 h-4 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Transactions & Matching */}
                <div className="md:col-span-2 space-y-6">
                    {selectedStatement ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
                            {/* Bank Side */}
                            <div className="flex flex-col border rounded-2xl overflow-hidden bg-white shadow-sm">
                                <div className="p-4 bg-zinc-50 border-b flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                                        <Search className="w-4 h-4 text-primary" /> Bank Statement
                                    </h3>
                                    <Badge variant="outline">{transactions.filter(t => t.is_reconciled).length} / {transactions.length} Matched</Badge>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    {transactions.map(txn => (
                                        <div 
                                            key={txn.id} 
                                            onClick={() => !txn.is_reconciled && findMatches(txn)}
                                            className={cn(
                                                "p-4 border-b last:border-0 cursor-pointer transition-all flex justify-between items-start",
                                                selectedTransaction?.id === txn.id ? "bg-blue-50/50 border-l-4 border-l-primary" : "hover:bg-zinc-50",
                                                txn.is_reconciled && "opacity-60 bg-green-50 pointer-events-none"
                                            )}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{txn.date}</p>
                                                <p className="font-bold text-zinc-900 truncate">{txn.description}</p>
                                                {txn.is_reconciled && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full mt-1">
                                                        <Check className="w-2.5 h-2.5" /> Reconciled
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={cn("font-black text-lg", txn.type === 'debit' ? "text-rose-600" : "text-emerald-600")}>
                                                    {txn.type === 'debit' ? '-' : '+'}{Math.abs(txn.amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* System Side */}
                            <div className="flex flex-col border rounded-2xl overflow-hidden bg-zinc-50 shadow-inner">
                                <div className="p-4 bg-white border-b flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                                        <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> System Matches
                                    </h3>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
                                    {selectedTransaction ? (
                                        <div className="space-y-4">
                                            {isLoadingMatches ? (
                                                <div className="py-20 text-center space-y-4">
                                                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                                                    <p className="text-zinc-500 font-medium">Scanning InvenIQ Records...</p>
                                                </div>
                                            ) : matches.length > 0 ? (
                                                <>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Suggested Matches</p>
                                                    {matches.map((match, i) => (
                                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-xs font-bold text-zinc-400">{match.ledger_entry.date}</p>
                                                                    <p className="font-bold text-zinc-900">{match.ledger_entry.description}</p>
                                                                    <p className="text-[10px] text-zinc-500">{match.ledger_entry.account.name} • {match.ledger_entry.party?.name || 'No Party'}</p>
                                                                </div>
                                                                <Badge className={cn(
                                                                    match.match_type === 'exact' ? "bg-emerald-500" : "bg-amber-500"
                                                                )}>
                                                                    {match.score}% Match
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                                                                <p className="font-black text-zinc-900">
                                                                    {match.ledger_entry.debit > 0 ? match.ledger_entry.debit : match.ledger_entry.credit}
                                                                </p>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-zinc-900 text-white rounded-lg hover:scale-105 transition-transform"
                                                                    onClick={() => reconcile(match.ledger_entry.id)}
                                                                >
                                                                    Link & Reconcile
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-zinc-200">
                                                    <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4 opacity-50" />
                                                    <p className="font-bold text-zinc-900">No Direct Match Found</p>
                                                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-2">The system couldn't find an automatic match for this transaction. Try manual search.</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                            <ArrowRightLeft className="w-20 h-20 mb-6 text-zinc-300" />
                                            <p className="text-zinc-500 font-bold">Select a Bank Transaction</p>
                                            <p className="text-sm max-w-[280px]">Select any transaction from the bank statement to search for matches in InvenIQ.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-40 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                            <CheckCircle2 className="w-24 h-24 text-zinc-200 mb-6" />
                            <h2 className="text-2xl font-black text-zinc-900">Start Reconciling</h2>
                            <p className="text-zinc-500 max-w-sm mt-2">Upload your bank statement and select it from the sidebar to begin matching your ledger records.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
