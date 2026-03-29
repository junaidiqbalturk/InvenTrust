"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
    Warehouse, 
    Plus, 
    Search, 
    Edit, 
    Trash2,
    MapPin,
    Phone,
    Circle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface WarehouseType {
    id: number;
    name: string;
    location: string;
    contact_number: string;
    status: 'active' | 'inactive';
}

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Add warehouse state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', contact_number: '', status: 'active' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get("/warehouses");
            setWarehouses(res.data);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWarehouses = warehouses.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddWarehouse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/warehouses", formData);
            setIsAddModalOpen(false);
            setFormData({ name: '', location: '', contact_number: '', status: 'active' });
            fetchWarehouses();
        } catch (error) {
            console.error("Error adding warehouse:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Warehouse Locations</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your storage hubs and distribution centers.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Warehouse
                </Button>
            </div>

            <Card className="border-border shadow-sm overflow-hidden bg-card">
                <CardHeader className="bg-muted/40 border-b border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search warehouses or locations..." 
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
                                <TableHead className="font-semibold px-6 py-4">Warehouse Name</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Location</TableHead>
                                <TableHead className="font-semibold px-6 py-4">Contact</TableHead>
                                <TableHead className="font-semibold px-6 py-4 text-center">Status</TableHead>
                                <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Loading warehouses...
                                    </TableCell>
                                </TableRow>
                            ) : filteredWarehouses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground px-6">
                                        No warehouses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredWarehouses.map((warehouse) => (
                                    <TableRow key={warehouse.id} className="hover:bg-muted/10 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                    <Warehouse className="h-5 w-5" />
                                                </div>
                                                <div className="font-medium text-foreground">{warehouse.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-sm">{warehouse.location || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span className="text-sm">{warehouse.contact_number || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <Circle className="h-2 w-2 fill-current" />
                                                {warehouse.status}
                                            </div>
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

            {/* Add Warehouse Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Warehouse</DialogTitle>
                        <DialogDescription>Enter the details of the new warehouse location.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddWarehouse} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Warehouse Name <span className="text-red-500">*</span></Label>
                            <Input 
                                id="name" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Main Hub" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input 
                                id="location" 
                                value={formData.location} 
                                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                                placeholder="e.g. 123 Storage Lane, City" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Number</Label>
                            <Input 
                                id="contact" 
                                value={formData.contact_number} 
                                onChange={(e) => setFormData({...formData, contact_number: e.target.value})} 
                                placeholder="e.g. +1 234 567 8900" 
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Warehouse"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
