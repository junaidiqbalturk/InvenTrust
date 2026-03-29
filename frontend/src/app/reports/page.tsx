"use client";

import { useState } from "react";
import { 
    PieChart, 
    BarChart3, 
    Scale, 
    Warehouse, 
    ChevronRight, 
    ArrowUpRight, 
    TrendingUp, 
    TrendingDown,
    Calendar,
    Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/components/providers/TranslationProvider";

export default function ReportsDashboard() {
    const { t } = useTranslation();

    const reportCards = [
        {
            title: "Profit & Loss",
            description: "View your revenue, COGS, and expenses over time.",
            icon: BarChart3,
            href: "/reports/profit-loss",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Balance Sheet",
            description: "Summarize your assets, liabilities, and equity.",
            icon: Scale,
            href: "/reports/balance-sheet",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Trial Balance",
            description: "A complete list of account balances for auditing.",
            icon: PieChart,
            href: "/reports/trial-balance",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            title: "Inventory Valuation",
            description: "Reconcile physical stock value against your ledger.",
            icon: Warehouse,
            href: "/reports/inventory-valuation",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Professional financial insights for your inventory business.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid (Mock data for now) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#1C2434] to-[#2E3A47] text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Net Revenue (MTD)</CardDescription>
                        <CardTitle className="text-3xl font-bold font-outfit">$48,250.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-400 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>12% from last month</span>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Operating Expenses</CardDescription>
                        <CardTitle className="text-2xl font-bold font-outfit">$12,400.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-rose-500 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>4% more than projected</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription>Inventory Value</CardDescription>
                        <CardTitle className="text-2xl font-bold font-outfit">$156,000.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-amber-500 gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>Covers 45 days of sales</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {reportCards.map((report) => (
                    <Link key={report.title} href={report.href}>
                        <Card className="group hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden border-border/50 shadow-sm hover:shadow-md">
                            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                                <div className={`p-3 rounded-lg ${report.bgColor} ${report.color} group-hover:scale-110 transition-transform`}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Activity or Insight (Mock) */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">Financial Health Insight</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-4">
                        <TrendingUp className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-medium text-primary">Your Gross Margin is up by 3%</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Optimization of the supply chain in the electronics category has reduced COGS significantly this quarter. 
                                Keep monitoring the exchange rate as it might impact Q4 imports.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
