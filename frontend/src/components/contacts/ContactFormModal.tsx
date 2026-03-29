"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ContactFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (party: any) => void;
    party?: any; // If provided, we are editing
    initialType?: 'customer' | 'supplier';
}

export function ContactFormModal({ isOpen, onClose, onSuccess, party, initialType = 'customer' }: ContactFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: initialType,
        phone: "",
        email: "",
        address: "",
        opening_balance: 0,
    });

    useEffect(() => {
        if (party) {
            setFormData({
                name: party.name || "",
                type: party.type || initialType,
                phone: party.phone || "",
                email: party.email || "",
                address: party.address || "",
                opening_balance: party.opening_balance || 0,
            });
        } else {
            setFormData({
                name: "",
                type: initialType,
                phone: "",
                email: "",
                address: "",
                opening_balance: 0,
            });
        }
    }, [party, initialType, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            let response;
            if (party) {
                response = await api.put(`/parties/${party.id}`, formData);
                toast.success("Contact updated successfully");
            } else {
                response = await api.post("/parties", formData);
                toast.success("Contact created successfully");
            }
            onSuccess(response.data.data || response.data);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save contact");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <div className="p-2 bg-primary rounded-lg text-white">
                                <User className="h-5 w-5" />
                            </div>
                            {party ? "Edit Contact" : "Add New Contact"}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            {party ? "Update existing contact details." : "Create a new customer or supplier in your system."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    required 
                                    className="pl-10 h-11 rounded-xl" 
                                    placeholder="John Doe or Company Name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(val: any) => setFormData({...formData, type: val})}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="supplier">Supplier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Opening Balance</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    className="pl-10 h-11 rounded-xl font-bold" 
                                    value={formData.opening_balance}
                                    onChange={e => setFormData({...formData, opening_balance: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    className="pl-10 h-11 rounded-xl" 
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="email"
                                    className="pl-10 h-11 rounded-xl" 
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea 
                                    className="pl-10 rounded-xl min-h-[80px]" 
                                    placeholder="Street, City, Country"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 font-black tracking-tight shadow-lg shadow-primary/20">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                party ? "Update Contact" : "Create Contact"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
