"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    Scale, 
    Loader2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";

interface FinancialItem {
    name: string;
    balance: number;
}

interface BalanceSheetData {
    date: string;
    assets: FinancialItem[];
    liabilities: FinancialItem[];
    equity: FinancialItem[];
    retained_earnings: number;
    summary: {
        total_assets: number;
        total_liabilities: number;
        total_equity: number;
        total_liabilities_equity: number;
    };
}

export default function BalanceSheet() {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/reports/balance-sheet");
            setData(response.data);
        } catch (error) {
            toast.error("Failed to load Balance Sheet");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            As of {new Date(data.date).toLocaleDateString()}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets Column */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-border/50">
                        <CardHeader className="bg-[#1C2434] text-white rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Assets</CardTitle>
                                <Scale className="h-5 w-5 opacity-50" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Current Assets</h3>
                            <Table>
                                <TableBody>
                                    {data.assets.map((item) => (
                                        <TableRow key={item.name} className="border-none hover:bg-transparent">
                                            <TableCell className="py-2">{item.name}</TableCell>
                                            <TableCell className="text-right py-2 font-medium">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-t-2 font-black italic uppercase">
                                        <TableCell className="py-4 text-primary">Total Assets</TableCell>
                                        <TableCell className="text-right py-4 text-primary">{formatCurrency(data.summary.total_assets)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-border/50">
                        <CardHeader className="bg-muted pb-4 border-b">
                            <CardTitle className="text-lg">Liabilities & Equity</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-8">
                            {/* Liabilities Section */}
                            <section>
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4">Current Liabilities</h3>
                                <Table>
                                    <TableBody>
                                        {data.liabilities.map((item) => (
                                            <TableRow key={item.name} className="border-none hover:bg-transparent">
                                                <TableCell className="py-2">{item.name}</TableCell>
                                                <TableCell className="text-right py-2 font-medium">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t font-bold">
                                            <TableCell className="py-3">Total Liabilities</TableCell>
                                            <TableCell className="text-right py-3">{formatCurrency(data.summary.total_liabilities)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </section>

                            {/* Equity Section */}
                            <section>
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4">Equity</h3>
                                <Table>
                                    <TableBody>
                                        {data.equity.map((item) => (
                                            <TableRow key={item.name} className="border-none hover:bg-transparent">
                                                <TableCell className="py-2">{item.name}</TableCell>
                                                <TableCell className="text-right py-2 font-medium">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Dynamic Net Income for the period */}
                                        <TableRow className="border-none hover:bg-transparent italic text-emerald-600 font-medium bg-emerald-500/5">
                                            <TableCell className="py-2">Retained Earnings (Net Income)</TableCell>
                                            <TableCell className="text-right py-2">{formatCurrency(data.retained_earnings)}</TableCell>
                                        </TableRow>
                                        <TableRow className="border-t font-bold">
                                            <TableCell className="py-3">Total Equity</TableCell>
                                            <TableCell className="text-right py-3">{formatCurrency(data.summary.total_equity)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </section>

                            <Separator />
                            
                            {/* Total L+E */}
                            <div className="flex justify-between items-center text-lg font-black uppercase italic text-[#1C2434] mt-4 px-2">
                                <span>Total Liabilities & Equity</span>
                                <span>{formatCurrency(data.summary.total_liabilities_equity)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Check if balanced */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">Accounting Equation Balanced</span>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Assets = L + E
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
