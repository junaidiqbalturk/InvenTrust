"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
    Settings, 
    Warehouse, 
    Building2, 
    Save, 
    Plus, 
    Trash2,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CompanySettings {
    company_name: string;
    email: string;
    currency: string;
    settings: {
        enable_multi_warehouse: boolean;
        default_warehouse_id: number | null;
    };
}

interface WarehouseData {
    id: number;
    name: string;
    location: string;
    is_active: boolean;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [company, setCompany] = useState<CompanySettings | null>(null);
    const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // New warehouse form
    const [showNewWarehouse, setShowNewWarehouse] = useState(false);
    const [newWhName, setNewWhName] = useState("");
    const [newWhLoc, setNewWhLoc] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [compRes, whRes] = await Promise.all([
                api.get("/company"),
                api.get("/warehouses")
            ]);
            setCompany(compRes.data);
            setWarehouses(whRes.data);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;
        setSaving(true);
        try {
            await api.put("/company", company);
            toast.success("Settings saved successfully");
        } catch (err) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleWMS = async (enabled: boolean) => {
        if (!company) return;
        const updated = {
            ...company,
            settings: { ...company.settings, enable_multi_warehouse: enabled }
        };
        setCompany(updated);
        try {
            await api.put("/company", updated);
            toast.success(`Multi-Warehouse ${enabled ? 'enabled' : 'disabled'}`);
        } catch (err) {
            toast.error("Failed to update WMS setting");
        }
    };

    const addWarehouse = async () => {
        if (!newWhName) return;
        try {
            const res = await api.post("/warehouses", { name: newWhName, location: newWhLoc });
            setWarehouses([...warehouses, res.data]);
            setNewWhName("");
            setNewWhLoc("");
            setShowNewWarehouse(false);
            toast.success("Warehouse added");
        } catch (err) {
            toast.error("Failed to add warehouse");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage your company profile and advanced system configurations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Navigation Tabs Logic here or just stacked cards */}
                <div className="md:col-span-2 space-y-8">
                    {/* General Settings */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="border-none shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Company Profile
                                </CardTitle>
                                <CardDescription>Basic information about your organization.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSaveGeneral} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Company Name</Label>
                                            <Input 
                                                value={company?.company_name} 
                                                onChange={e => setCompany(c => c ? {...c, company_name: e.target.value} : null)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Business Email</Label>
                                            <Input 
                                                value={company?.email} 
                                                onChange={e => setCompany(c => c ? {...c, email: e.target.value} : null)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Standard Currency</Label>
                                        <Input 
                                            value={company?.currency} 
                                            onChange={e => setCompany(c => c ? {...c, currency: e.target.value} : null)}
                                            className="w-32"
                                        />
                                    </div>
                                    <Button disabled={saving} className="mt-4">
                                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Advanced WMS Configuration */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-none shadow-sm overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Warehouse className="h-5 w-5 text-primary" />
                                            Advanced WMS
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Enable Multi-Warehouse support to track stock across locations.</p>
                                    </div>
                                    <Switch 
                                        checked={company?.settings.enable_multi_warehouse} 
                                        onCheckedChange={toggleWMS}
                                    />
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {company?.settings.enable_multi_warehouse && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-6 space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Locations</h4>
                                            <Button size="sm" variant="outline" onClick={() => setShowNewWarehouse(true)}>
                                                <Plus className="h-4 w-4 mr-1" /> Add Location
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {warehouses.map((wh) => (
                                                <div key={wh.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-muted p-2 rounded-lg">
                                                            <Warehouse className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{wh.name}</p>
                                                            <p className="text-xs text-muted-foreground">{wh.location || 'No location set'}</p>
                                                        </div>
                                                    </div>
                                                    {company.settings.default_warehouse_id === wh.id ? (
                                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase tracking-tighter italic">Primary</span>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                </div>

                {/* Right: Quick Help / Info */}
                <div className="space-y-6">
                    <Card className="bg-[#020617] text-white border-none shadow-xl p-6 overflow-hidden relative">
                        <div className="relative z-10">
                            <CardTitle className="text-lg">System Status</CardTitle>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm opacity-80">Inventory Audit: Enabled</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm opacity-80">Double-Entry GL: Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm opacity-80">Security: Tier 1</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Settings className="h-32 w-32" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* New Warehouse Dialog Mock */}
            <AnimatePresence>
                {showNewWarehouse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
                        >
                            <div className="p-6 border-b">
                                <h3 className="text-xl font-bold">Add New Location</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Warehouse Name</Label>
                                    <Input placeholder="e.g. Dubai South Hub" value={newWhName} onChange={e => setNewWhName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location / Address</Label>
                                    <Input placeholder="Physical address" value={newWhLoc} onChange={e => setNewWhLoc(e.target.value)} />
                                </div>
                            </div>
                            <div className="p-6 bg-muted/50 flex gap-3">
                                <Button className="flex-1" onClick={addWarehouse}>Create Warehouse</Button>
                                <Button variant="ghost" onClick={() => setShowNewWarehouse(false)}>Cancel</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
