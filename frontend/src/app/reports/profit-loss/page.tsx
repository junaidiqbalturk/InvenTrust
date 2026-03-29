"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    Calendar, 
    TrendingUp, 
    TrendingDown,
    Loader2
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

interface ProfitLossData {
    period: { start: string; end: string };
    revenue: FinancialItem[];
    cogs: number;
    expenses: FinancialItem[];
    summary: {
        total_revenue: number;
        gross_profit: number;
        total_operating_expenses: number;
        net_income: number;
    };
}

export default function ProfitLossReport() {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/reports/profit-loss");
            setData(response.data);
        } catch (error) {
            toast.error("Failed to load Profit & Loss report");
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
                        <h1 className="text-2xl font-bold tracking-tight">Profit & Loss</h1>
                        <p className="text-sm text-muted-foreground">
                            For the period {new Date(data.period.start).toLocaleDateString()} to {new Date(data.period.end).toLocaleDateString()}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Statement */}
                <Card className="lg:col-span-2 shadow-lg border-border/50">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Income Statement</CardTitle>
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">
                        {/* Revenue Section */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Revenue</h3>
                            <Table>
                                <TableBody>
                                    {data.revenue.map((item) => (
                                        <TableRow key={item.name} className="border-none hover:bg-transparent">
                                            <TableCell className="py-2">{item.name}</TableCell>
                                            <TableCell className="text-right py-2 font-medium">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-t font-bold">
                                        <TableCell className="py-3">Total Revenue</TableCell>
                                        <TableCell className="text-right py-3">{formatCurrency(data.summary.total_revenue)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </section>

                        {/* COGS Section */}
                        <section className="bg-muted/20 p-4 rounded-lg">
                            <div className="flex justify-between items-center font-bold">
                                <span>Cost of Goods Sold (COGS)</span>
                                <span className="text-rose-500">{formatCurrency(data.cogs)}</span>
                            </div>
                        </section>

                        {/* Gross Profit */}
                        <section className="border-y-2 border-primary/20 py-4">
                            <div className="flex justify-between items-center text-lg font-black italic uppercase">
                                <span>Gross Profit</span>
                                <span className="text-primary">{formatCurrency(data.summary.gross_profit)}</span>
                            </div>
                        </section>

                        {/* Expenses Section */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Operating Expenses</h3>
                            <Table>
                                <TableBody>
                                    {data.expenses.map((item) => (
                                        <TableRow key={item.name} className="border-none hover:bg-transparent">
                                            <TableCell className="py-2">{item.name}</TableCell>
                                            <TableCell className="text-right py-2 font-medium">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-t font-bold">
                                        <TableCell className="py-3">Total Expenses</TableCell>
                                        <TableCell className="text-right py-3 text-rose-500">{formatCurrency(data.summary.total_operating_expenses)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </section>

                        {/* Net Income */}
                        <section className="bg-primary text-primary-foreground p-6 rounded-xl shadow-inner mt-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-80 mb-1">Net Income / Loss</p>
                                    <h2 className="text-4xl font-black font-outfit tracking-tighter">
                                        {formatCurrency(data.summary.net_income)}
                                    </h2>
                                </div>
                                {data.summary.net_income >= 0 ? (
                                    <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                        <TrendingUp className="h-6 w-6" />
                                        <span className="font-bold">Profitable</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-rose-500/50 p-2 rounded-lg backdrop-blur-sm">
                                        <TrendingDown className="h-6 w-6" />
                                        <span className="font-bold">In Loss</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </CardContent>
                </Card>

                {/* Sidebar Stats/Insights */}
                <div className="space-y-6">
                    <Card className="shadow-md border-border/50">
                        <CardHeader>
                            <CardTitle className="text-sm">Profitability Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Gross Margin</span>
                                <span className="font-bold">
                                    {((data.summary.gross_profit / data.summary.total_revenue) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${(data.summary.gross_profit / data.summary.total_revenue) * 100}%` }}
                                ></div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Net Margin</span>
                                <span className="font-bold text-primary">
                                    {((data.summary.net_income / data.summary.total_revenue) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-border/50 bg-gradient-to-br from-muted/50 to-background">
                        <CardHeader>
                            <CardTitle className="text-sm">Breakdown</CardTitle>
                            <CardDescription>Income vs Expenses</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center py-6">
                            <div className="relative h-48 w-48">
                                {/* Simple representation - In a real app we'd use a chart library */}
                                <div className="absolute inset-0 rounded-full border-[16px] border-emerald-500/20 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Operating Ratio</p>
                                        <p className="text-xl font-bold">
                                            {((data.summary.total_operating_expenses / data.summary.total_revenue) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="16"
                                        strokeDasharray={`${(data.summary.total_operating_expenses / data.summary.total_revenue) * 502} 502`}
                                        className="text-rose-500"
                                    />
                                </svg>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
