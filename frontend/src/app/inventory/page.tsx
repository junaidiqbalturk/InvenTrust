"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Package, 
    Plus, 
    Search, 
    AlertTriangle, 
    Edit, 
    Trash2, 
    ArrowUpCircle, 
    ArrowDownCircle,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    unit: string;
    purchase_price: number;
    sale_price: number;
    stock_quantity: number;
    low_stock_threshold: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [stockAction, setStockAction] = useState<"in" | "out">("in");
    const [stockAmount, setStockAmount] = useState(0);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        unit: "pcs",
        purchase_price: 0,
        sale_price: 0,
        stock_quantity: 0,
        low_stock_threshold: 10
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/products");
            setProducts(data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await api.put(`/products/${currentProduct.id}`, formData);
                toast.success("Product updated successfully");
            } else {
                await api.post("/products", formData);
                toast.success("Product added successfully");
            }
            setIsProductModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleStockAdjustment = async () => {
        if (!currentProduct) return;
        const newQty = stockAction === "in" 
            ? currentProduct.stock_quantity + stockAmount 
            : currentProduct.stock_quantity - stockAmount;
        
        try {
            await api.put(`/products/${currentProduct.id}`, { stock_quantity: newQty });
            toast.success(`Stock ${stockAction === "in" ? "added" : "removed"} successfully`);
            setIsStockModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error("Failed to adjust stock");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage your products and track stock levels.</p>
                </div>
                <Button onClick={() => {
                    setCurrentProduct(null);
                    setFormData({
                        name: "", sku: "", category: "", unit: "pcs",
                        purchase_price: 0, sale_price: 0, stock_quantity: 0, low_stock_threshold: 10
                    });
                    setIsProductModalOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or SKU..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Total {products.length} products in catalog.</CardDescription>
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
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Sale Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${product.stock_quantity <= product.low_stock_threshold ? 'text-destructive' : ''}`}>
                                                    {product.stock_quantity}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{product.unit}</span>
                                                {product.stock_quantity <= product.low_stock_threshold && (
                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>${product.sale_price}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setCurrentProduct(product);
                                                setStockAction("in");
                                                setStockAmount(0);
                                                setIsStockModalOpen(true);
                                            }}>
                                                <ArrowUpCircle className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setCurrentProduct(product);
                                                setStockAction("out");
                                                setStockAmount(0);
                                                setIsStockModalOpen(true);
                                            }}>
                                                <ArrowDownCircle className="h-4 w-4 text-rose-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setCurrentProduct(product);
                                                setFormData({ ...product });
                                                setIsProductModalOpen(true);
                                            }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Product Modal */}
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveProduct} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU</label>
                                <Input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Unit</label>
                                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purchase Price</label>
                                <Input type="number" step="0.01" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sale Price</label>
                                <Input type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Initial Stock</label>
                                <Input type="number" value={formData.stock_quantity} disabled={!!currentProduct} onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Low Stock Alert at</label>
                                <Input type="number" value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Stock In/Out Modal */}
            <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Stock {stockAction === "in" ? "In" : "Out"}</DialogTitle>
                        <CardDescription>{currentProduct?.name}</CardDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity to {stockAction === "in" ? "Add" : "Remove"}</label>
                            <Input 
                                type="number" 
                                min="1" 
                                value={stockAmount} 
                                onChange={e => setStockAmount(parseInt(e.target.value))}
                                autoFocus
                            />
                        </div>
                        <Button className="w-full" onClick={handleStockAdjustment}>
                            {stockAction === "in" ? "Add Stock" : "Remove Stock"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
