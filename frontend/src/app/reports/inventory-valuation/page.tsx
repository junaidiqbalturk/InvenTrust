"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    ChevronLeft, 
    Download, 
    Printer, 
    Warehouse, 
    AlertTriangle, 
    CheckCircle2,
    Loader2,
    RefreshCw,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface ProductValuation {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    valuation: number;
}

interface ValuationData {
    as_of: string;
    products: ProductValuation[];
    summary: {
        total_physical_valuation: number;
        ledger_balance: number;
        discrepancy: number;
    };
}

export default function InventoryValuation() {
    const [data, setData] = useState<ValuationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/reports/inventory-valuation");
            setData(response.data);
        } catch (error) {
            toast.error("Failed to load inventory valuation");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = data?.products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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

    const hasDiscrepancy = Math.abs(data.summary.discrepancy) > 1;

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
                        <h1 className="text-2xl font-bold tracking-tight">Inventory Reconciliation</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            As of {new Date(data.as_of).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchReport} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Reconciliation Status Card */}
            <Card className={`border-2 shadow-xl ${hasDiscrepancy ? 'border-rose-500/20 bg-rose-50/10' : 'border-emerald-500/20 bg-emerald-50/10'}`}>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-full ${hasDiscrepancy ? 'bg-rose-500' : 'bg-emerald-500'} text-white shadow-lg shadow-black/10`}>
                                {hasDiscrepancy ? <AlertTriangle className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black font-outfit uppercase">
                                    {hasDiscrepancy ? 'Discrepancy Found' : 'Perfectly Reconciled'}
                                </h2>
                                <p className="text-muted-foreground mr-6">
                                    {hasDiscrepancy 
                                        ? 'Physical stock value does not match the general ledger balance. Review recent adjustments.' 
                                        : 'All physical movements match the financial records. Your ledger is clean.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-end gap-12 text-right">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Total Physical Value</p>
                                <p className="text-xl font-black font-outfit">{formatCurrency(data.summary.total_physical_valuation)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">GL Inventory (1300)</p>
                                <p className="text-xl font-black font-outfit">{formatCurrency(data.summary.ledger_balance)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Variance</p>
                                <p className={`text-xl font-black font-outfit ${hasDiscrepancy ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {formatCurrency(data.summary.discrepancy)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Product Valuation Table */}
            <Card className="shadow-lg border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Physical Inventory Valuation</CardTitle>
                            <CardDescription>Breakdown by product based on current stock levels and purchase costs.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search product or SKU..." 
                                className="pl-9 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/20">
                        <TableRow>
                            <TableHead className="font-bold">Product Name</TableHead>
                            <TableHead className="font-bold">SKU</TableHead>
                            <TableHead className="text-right font-bold">In-Stock</TableHead>
                            <TableHead className="text-right font-bold">Cost Price</TableHead>
                            <TableHead className="text-right font-bold">Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium py-4">{product.name}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className="font-mono text-[10px]">{product.sku}</Badge>
                                </TableCell>
                                <TableCell className="text-right py-4">{product.quantity.toLocaleString()}</TableCell>
                                <TableCell className="text-right py-4 font-medium text-slate-500">{formatCurrency(product.unit_price)}</TableCell>
                                <TableCell className="text-right py-4 font-black text-foreground">{formatCurrency(product.valuation)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No products found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Advice Section */}
            {hasDiscrepancy && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg flex items-start gap-4 animate-bounce">
                    <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-amber-700">Audit Needed</p>
                        <p className="text-sm text-amber-600/80">
                            Discrepancies usually occur due to manual stock adjustments that weren't mirrored in the accounting ledger, 
                            or purchases that were recorded but not yet "Posted" to inventory. Run a ledger audit on Account 1300 to investigate.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
