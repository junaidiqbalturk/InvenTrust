"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Shield, 
    Plus, 
    Trash2, 
    Edit, 
    Loader2, 
    Check, 
    X,
    Settings2,
    Lock,
    Globe,
    Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Permission {
    id: number;
    name: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
    company_id: number | null;
    permissions: Permission[];
}

export default function RolesPermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    
    // Modal/Panel states
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({ name: "", description: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get("/roles"),
                api.get("/roles/permissions")
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
            if (rolesRes.data.length > 0) setSelectedRole(rolesRes.data[0]);
        } catch (err) {
            toast.error("Failed to load roles and permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingRole) {
                const res = await api.put(`/roles/${editingRole.id}`, roleForm);
                setRoles(roles.map(r => r.id === editingRole.id ? { ...res.data, permissions: r.permissions } : r));
                toast.success("Role updated");
            } else {
                const res = await api.post("/roles", roleForm);
                setRoles([...roles, { ...res.data, permissions: [] }]);
                toast.success("Custom role created");
            }
            setShowRoleModal(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = async (permId: number) => {
        if (!selectedRole || selectedRole.company_id === null) {
            toast.error("Global roles cannot be modified");
            return;
        }

        const isAssigned = selectedRole.permissions.some(p => p.id === permId);
        const newPerms = isAssigned 
            ? selectedRole.permissions.filter(p => p.id !== permId).map(p => p.id)
            : [...selectedRole.permissions.map(p => p.id), permId];

        try {
            const res = await api.put(`/roles/${selectedRole.id}`, {
                name: selectedRole.name,
                description: selectedRole.description,
                permissions: newPerms
            });
            
            const updatedRole = res.data;
            setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
            setSelectedRole(updatedRole);
            toast.success("Permissions updated");
        } catch (err) {
            toast.error("Failed to update permissions");
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (!confirm(`Delete role "${role.name}"? Users with this role will lose access.`)) return;
        try {
            await api.delete(`/roles/${role.id}`);
            setRoles(roles.filter(r => r.id !== role.id));
            if (selectedRole?.id === role.id) setSelectedRole(roles[0] || null);
            toast.success("Role deleted");
        } catch (err) {
            toast.error("Failed to delete role");
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
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Roles & Permissions
                    </h1>
                    <p className="text-muted-foreground text-sm">Define access levels and granular permissions for your workspace.</p>
                </div>
                <Button onClick={() => { setEditingRole(null); setRoleForm({ name: "", description: "" }); setShowRoleModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Custom Role
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Roles List */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Roles</h3>
                    {roles.map((role) => (
                        <motion.div
                            key={role.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedRole(role)}
                            className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 relative overflow-hidden group ${
                                selectedRole?.id === role.id 
                                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                                    : 'bg-card border-muted hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${selectedRole?.id === role.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}>
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <div className="font-black text-sm">{role.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                            Role ID: #{role.id}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingRole(role); setRoleForm({ name: role.name, description: role.description || "" }); setShowRoleModal(true); }} className="p-1 hover:text-primary transition-colors">
                                        <Edit size={14} />
                                    </button>
                                    {role.name !== 'Admin' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }} className="p-1 hover:text-destructive transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right: Permission Matrix */}
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-sm h-full">
                        <CardHeader className="bg-muted/30 border-b pb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-black">{selectedRole?.name}</CardTitle>
                                    <CardDescription>{selectedRole?.description || 'No description provided.'}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {permissions.map((perm) => (
                                    <div 
                                        key={perm.id} 
                                        className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                                            selectedRole?.permissions.some(p => p.id === perm.id)
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : 'bg-card border-muted/30 opacity-60'
                                        }`}
                                    >
                                        <div className="pt-1">
                                            <Checkbox 
                                                id={`perm-${perm.id}`}
                                                checked={selectedRole?.permissions.some(p => p.id === perm.id)}
                                                onCheckedChange={() => togglePermission(perm.id)}
                                                disabled={selectedRole?.company_id === null}
                                                className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label 
                                                htmlFor={`perm-${perm.id}`} 
                                                className={`font-black tracking-tight cursor-pointer ${selectedRole?.permissions.some(p => p.id === perm.id) ? 'text-emerald-500' : 'text-foreground'}`}
                                            >
                                                {perm.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Label>
                                            <p className="text-xs text-muted-foreground leading-tight">
                                                Allows the user to {perm.description || `access the ${perm.name.replace('_', ' ')} module.`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Role Create/Edit Modal */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="text-xl font-bold">{editingRole ? 'Edit Custom Role' : 'Create Custom Role'}</h3>
                                <button onClick={() => setShowRoleModal(false)} className="text-muted-foreground"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSaveRole}>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Role Name</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-10" placeholder="e.g. Warehouse Supervisor" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <div className="relative">
                                            <Settings2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <textarea 
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10" 
                                                placeholder="What can this role do?" 
                                                value={roleForm.description} 
                                                onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-muted/50 flex gap-3">
                                    <Button type="submit" className="flex-1" disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                        {editingRole ? 'Save Changes' : 'Create Role'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
