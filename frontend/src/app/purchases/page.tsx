"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingBag, Truck, Calendar, DollarSign, Trash2, Loader2, Minus, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                                            <TableCell className="font-bold">${pur.total_amount}</TableCell>
                                            <TableCell className="text-green-600">${pur.paid_amount}</TableCell>
                                            <TableCell className="text-rose-600">${pur.due_amount}</TableCell>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Record New Purchase</DialogTitle>
                        <DialogDescription>Add supplier details and items purchased.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePurchase} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Supplier</label>
                                <Select value={selectedParty} onValueChange={(val) => val && setSelectedParty(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purchase Date</label>
                                <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">Purchase Items</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/2">Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Select value={item.product_id} onValueChange={(val) => val && updateItem(index, "product_id", val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value))} />
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                ${(item.quantity * item.unit_price).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                    <Minus className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Paid Amount</label>
                                    <Input type="number" className="bg-green-50" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value))} />
                                </div>
                            </div>
                            <div className="bg-muted p-6 rounded-xl flex flex-col justify-center space-y-4 text-right">
                                <div className="flex justify-between items-center text-2xl font-black">
                                    <span>Total Payable:</span>
                                    <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-muted-foreground">Remaining Debt:</span>
                                    <span className="font-bold text-rose-600">${(calculateTotal() - paidAmount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full h-12 text-lg">Record Purchase & Add Stock</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
