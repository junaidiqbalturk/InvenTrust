"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
    Package, 
    Plus, 
    Search, 
    MoreVertical, 
    Edit, 
    Trash2,
    DollarSign,
    Box
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Product {
    id: number;
    name: string;
    sku: string;
    unit_cost: number;
    unit: string;
    description: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', sku: '', unit_cost: '', unit: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/products", {
                ...formData,
                unit_cost: parseFloat(formData.unit_cost)
            });
            setIsAddModalOpen(false);
            setFormData({ name: '', sku: '', unit_cost: '', unit: '', description: '' });
            fetchProducts();
        } catch (error) {
            console.error("Error adding product:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Product (SKU) Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Define and manage your product catalog.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                </Button>
            </div>

            <Card className="border-border shadow-sm overflow-hidden bg-card">
                <CardHeader className="bg-muted/40 border-b border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search products or SKUs..." 
                                className="pl-10 h-10 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-semibold px-6 py-4">Product Info</TableHead>
                                <TableHead className="font-semibold px-6 py-4">SKU</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Unit Cost</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Unit</TableHead>
                                <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground px-6">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-muted/10 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{product.description || 'No description'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded border border-border">
                                                {product.sku}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-semibold text-foreground">
                                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                {parseFloat(product.unit_cost.toString()).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-muted-foreground">
                                            {product.unit}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Product Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Create a new product (SKU) in your catalog.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                            <Input 
                                id="name" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Premium Component" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="sku" 
                                    required 
                                    value={formData.sku} 
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                                    placeholder="e.g. PRD-001" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="unit" 
                                    required 
                                    value={formData.unit} 
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                                    placeholder="e.g. null, pcs, kg" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit_cost">Unit Cost <span className="text-red-500">*</span></Label>
                            <Input 
                                id="unit_cost" 
                                type="number"
                                step="0.01"
                                min="0"
                                required 
                                value={formData.unit_cost} 
                                onChange={(e) => setFormData({...formData, unit_cost: e.target.value})} 
                                placeholder="0.00" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input 
                                id="description" 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                placeholder="Short description of the product" 
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
