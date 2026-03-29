"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingBag, Truck, Calendar, DollarSign, Trash2, Loader2, Minus, PlusCircle, User, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactFormModal } from "@/components/contacts/ContactFormModal";

interface Purchase {
    id: number;
    purchase_no: string;
    party: { name: string };
    date: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    status: string;
}

interface Product {
    id: number;
    name: string;
    purchase_price: number;
    stock_quantity: number;
}

interface Party {
    id: number;
    name: string;
    type: string;
}

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form states
    const [selectedParty, setSelectedParty] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidAmount, setPaidAmount] = useState(0);
    const [items, setItems] = useState<{product_id: string, quantity: number, unit_price: number}[]>([]);

    // Quick Add Contact Modal
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [purRes, prodRes, partyRes] = await Promise.all([
                api.get("/purchases"),
                api.get("/products"),
                api.get("/parties?type=supplier")
            ]);
            setPurchases(purRes.data);
            setProducts(prodRes.data);
            setParties(partyRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === "product_id") {
            const product = products.find(p => p.id.toString() === value);
            if (product) {
                newItems[index].unit_price = product.purchase_price;
            }
        }
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleCreatePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error("Add at least one item");
            return;
        }

        try {
            await api.post("/purchases", {
                party_id: selectedParty,
                date: purchaseDate,
                paid_amount: paidAmount,
                items
            });
            toast.success("Purchase recorded successfully");
            setIsCreateModalOpen(false);
            fetchData();
            // Reset form
            setItems([]);
            setSelectedParty("");
            setPaidAmount(0);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record purchase");
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Management</h1>
                    <p className="text-muted-foreground">Record stock additions and supplier purchases.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Purchase
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Purchases</CardTitle>
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
                                    <TableHead>Purchase #</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No purchases found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchases.map((pur) => (
                                        <TableRow key={pur.id}>
                                            <TableCell className="font-mono font-bold">{pur.purchase_no}</TableCell>
                                            <TableCell>{pur.party.name}</TableCell>
                                            <TableCell>{new Date(pur.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold">${Number(pur.total_amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-green-600">${Number(pur.paid_amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-rose-600">${Number(pur.due_amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                    pur.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                    pur.status === 'partial' ? 'bg-amber-100 text-amber-700' : 
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {pur.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Purchase Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-5xl w-full max-h-[96vh] rounded-3xl overflow-hidden p-0 border-none shadow-2xl flex flex-col">
                    <div className="bg-primary/5 p-8 border-b border-primary/10 flex-shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight">Record New Purchase</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium">Add supplier details and items purchased to update your stock.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleCreatePurchase} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar min-h-0">
                            {/* Header Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end bg-card p-6 rounded-2xl border border-muted/30 shadow-sm">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" /> Supplier
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select value={selectedParty} onValueChange={(val) => val && setSelectedParty(val)}>
                                            <SelectTrigger className="h-11 rounded-xl border-muted-foreground/20 focus:ring-primary/20 flex-1 overflow-hidden">
                                                <SelectValue placeholder="Select a supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parties.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-11 w-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5 shrink-0"
                                            onClick={() => setIsQuickAddModalOpen(true)}
                                            title="Add New Supplier"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-primary" /> Purchase Date
                                    </Label>
                                    <Input type="date" className="h-11 rounded-xl border-muted-foreground/20 w-full" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 hidden lg:block">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        Warehouse Status
                                    </Label>
                                    <div className="h-11 flex items-center px-4 bg-primary/5 text-primary font-bold rounded-xl border border-primary/10 tracking-wide uppercase text-[10px]">
                                        RECEIVING STOCK
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                        Purchase Items
                                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-bold">{items.length} Items</span>
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-full px-4 border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all h-9">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>
                                <div className="rounded-2xl border border-muted/30 overflow-hidden shadow-sm bg-card">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-1/2 font-black text-[10px] uppercase tracking-wider py-4 px-6 text-muted-foreground">Product Details</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Quantity</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Unit Cost</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase tracking-wider py-4 text-muted-foreground">Subtotal</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-muted/5 transition-colors border-muted/20 last:border-none">
                                                    <TableCell className="py-4 px-6">
                                                        <Select value={item.product_id} onValueChange={(val) => val && updateItem(index, "product_id", val)}>
                                                            <SelectTrigger className="border-none bg-transparent hover:bg-muted/20 transition-all font-bold p-0 h-auto focus:ring-0 w-full text-left truncate">
                                                                <SelectValue placeholder="Search or Select Product..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.name} <span className="opacity-50 font-normal ml-2">(Current Stock: {p.stock_quantity})</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Input type="number" className="h-9 w-24 rounded-lg bg-muted/10 border-transparent focus:bg-white transition-all font-bold" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} />
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-1 font-bold">
                                                            <span className="text-muted-foreground font-black text-xs">$</span>
                                                            <Input type="number" className="h-9 w-28 rounded-lg bg-muted/10 border-transparent focus:bg-white transition-all font-bold" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value))} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 font-black text-primary">
                                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6">
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-full h-8 w-8 transition-colors">
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {items.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic font-medium">
                                                        Click "Add Item" to record products purchased.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Summary & Totals */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-4">
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Payment Made to Supplier</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                            <Input type="number" className="pl-11 h-12 rounded-xl text-xl font-black bg-white border-emerald-500/20 text-emerald-600 focus:ring-emerald-500/20 shadow-sm" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="bg-card p-6 rounded-2xl border border-muted/30 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Purchase Notes</h4>
                                        <textarea 
                                            className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                                            placeholder="Supplier reference, delivery notes or internal comments..."
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-5 h-full">
                                    <div className="bg-[#1C2434] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center space-y-6 border border-white/5 relative overflow-hidden group min-h-[280px]">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                            <ShoppingBag size={100} />
                                        </div>
                                        <div className="space-y-5 relative z-10 w-full">
                                            <div className="flex justify-between items-center text-white/50">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Gross Total</span>
                                                <span className="font-bold tracking-tight">${calculateTotal().toFixed(2)}</span>
                                            </div>
                                            <div className="h-px bg-white/10 my-4" />
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-black uppercase tracking-widest text-primary mt-1">Total Payable</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-5xl font-black tracking-tighter text-primary truncate max-w-full">${calculateTotal().toFixed(2)}</span>
                                                    <span className="text-[10px] text-white/40 mt-1 italic tracking-wide lowercase">total stock valuation</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 text-sm text-white/80">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Remaining Debt</span>
                                                <span className={`font-black px-4 py-1.5 rounded-xl text-base ${calculateTotal() - paidAmount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'}`}>
                                                    ${(calculateTotal() - paidAmount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-muted/20 backdrop-blur-sm flex-shrink-0">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="hidden md:flex items-center gap-3 text-muted-foreground italic font-medium">
                                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                                    <p className="text-[10px] tracking-tight">Stock levels will be updated immediately upon recording purchase.</p>
                                </div>
                                <Button type="submit" className="w-full sm:w-auto h-14 px-16 text-lg font-black tracking-tight rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white">
                                    Record Purchase & Add Stock
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ContactFormModal 
                isOpen={isQuickAddModalOpen}
                onClose={() => setIsQuickAddModalOpen(false)}
                initialType="supplier"
                onSuccess={(newParty) => {
                    fetchData();
                    setSelectedParty(newParty.id.toString());
                }}
            />
        </div>
    );
}
