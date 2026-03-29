"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, Phone, Mail, MapPin, DollarSign, Loader2, Edit2, Trash2, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ContactFormModal } from "@/components/contacts/ContactFormModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Party {
    id: number;
    name: string;
    type: 'customer' | 'supplier';
    phone: string;
    email: string;
    address: string;
    opening_balance: number;
    current_balance: number;
}

export default function ContactsPage() {
    const [parties, setParties] = useState<Party[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/parties");
            setParties(data.data || data); // Handle both wrapped and unwrapped data
        } catch (error) {
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!partyToDelete) return;
        try {
            await api.delete(`/parties/${partyToDelete.id}`);
            toast.success("Contact deleted successfully");
            setParties(parties.filter(p => p.id !== partyToDelete.id));
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete contact. It may be linked to invoices.");
        }
    };

    const filteredParties = parties.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             (p.phone && p.phone.includes(searchQuery));
        
        const matchesTab = activeTab === "all" || p.type === activeTab;
        
        return matchesSearch && matchesTab;
    });

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-2xl text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        Contacts Management
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage your customers and suppliers in one place.</p>
                </div>
                <Button 
                    onClick={() => {
                        setSelectedParty(null);
                        setIsFormModalOpen(true);
                    }}
                    className="h-12 px-6 rounded-2xl font-black tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add New Contact
                </Button>
            </div>

            <Card className="rounded-[2rem] border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                            <TabsList className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                <TabsTrigger value="all" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">All Contacts</TabsTrigger>
                                <TabsTrigger value="customer" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Customers</TabsTrigger>
                                <TabsTrigger value="supplier" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Suppliers</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search contacts..." 
                                className="pl-11 h-12 rounded-xl bg-white border-gray-200 focus:ring-primary/10 shadow-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-24">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/30">
                                    <TableRow className="hover:bg-transparent border-gray-100">
                                        <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-gray-500">Contact Details</TableHead>
                                        <TableHead className="py-6 font-black text-[10px] uppercase tracking-widest text-gray-500">Type & Contact</TableHead>
                                        <TableHead className="py-6 font-black text-[10px] uppercase tracking-widest text-gray-500">Address Info</TableHead>
                                        <TableHead className="py-6 text-right font-black text-[10px] uppercase tracking-widest text-gray-500">Current Balance</TableHead>
                                        <TableHead className="py-6 px-8 text-right font-black text-[10px] uppercase tracking-widest text-gray-500">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParties.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400 italic">
                                                    <User className="h-12 w-12 mb-3 opacity-20" />
                                                    <p className="font-medium">No contacts found.</p>
                                                    <Button variant="link" className="text-primary font-bold mt-2" onClick={() => setIsFormModalOpen(true)}>
                                                        Add your first contact
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredParties.map((party) => (
                                            <TableRow key={party.id} className="hover:bg-gray-50/50 transition-colors border-gray-100 last:border-none group">
                                                <TableCell className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-white shadow-lg ${party.type === 'customer' ? 'bg-primary shadow-primary/20' : 'bg-gray-700 shadow-gray-700/20'}`}>
                                                            {party.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg leading-tight">{party.name}</div>
                                                            <div className="text-xs font-black uppercase text-gray-400 mt-1 tracking-wider opacity-60">ID #P{party.id.toString().padStart(4, '0')}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 font-medium">
                                                    <div className="space-y-1.5">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${party.type === 'customer' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700'}`}>
                                                            {party.type}
                                                        </span>
                                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-gray-400" /> {party.phone || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                                            <Mail className="h-3 w-3 text-gray-400" /> {party.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 max-w-[200px]">
                                                    <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                        <MapPin className="h-3 w-3 inline mr-1 text-gray-400" />
                                                        {party.address || 'No address provided'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 text-right">
                                                    <div className={`text-xl font-black tabular-nums ${Number(party.current_balance || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        ${Math.abs(Number(party.current_balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        <span className="text-[10px] ml-1 uppercase opacity-40">
                                                            {Number(party.current_balance || 0) < 0 ? 'Debit' : 'Credit'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 opacity-60">Opening: ${Number(party.opening_balance || 0).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-10 w-10 rounded-xl border-gray-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                                            onClick={() => {
                                                                setSelectedParty(party);
                                                                setIsFormModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-10 w-10 rounded-xl border-gray-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                            onClick={() => {
                                                                setPartyToDelete(party);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ContactFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSuccess={() => fetchParties()}
                party={selectedParty}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-[2rem] p-8 border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight text-gray-900">Delete Contact?</AlertDialogTitle>
                        <AlertDialogDescription className="text-lg font-medium text-gray-500 leading-relaxed mt-2">
                            This action cannot be undone. You will lose all historical record of <span className="text-gray-900 font-bold underline underline-offset-4 decoration-rose-500/30">"{partyToDelete?.name}"</span>. 
                            If they have existing transactions, the deletion will fail.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3 sm:gap-2">
                        <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="h-12 px-8 rounded-xl font-black tracking-tight bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20"
                        >
                            Delete Contact Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
