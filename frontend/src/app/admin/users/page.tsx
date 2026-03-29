"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Users, 
    Plus, 
    Trash2, 
    Edit, 
    Loader2, 
    Shield, 
    Mail, 
    Search,
    UserPlus,
    CheckCircle2,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Role {
    id: number;
    name: string;
    description: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role?: Role;
    created_at: string;
}

export default function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role_id: "",
        password: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get("/users"),
                api.get("/roles")
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (err) {
            toast.error("Failed to load user management data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role_id: user.role_id.toString(),
                password: ""
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: "",
                email: "",
                role_id: roles[0]?.id.toString() || "",
                password: ""
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingUser) {
                const res = await api.put(`/users/${editingUser.id}`, formData);
                setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
                toast.success("User updated successfully");
            } else {
                const res = await api.post("/users", formData);
                setUsers([...users, res.data]);
                toast.success("User invited successfully");
            }
            setShowModal(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            toast.success("User deleted");
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Team Members
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage your workspace collaborators and their access levels.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20 hover:bg-muted/20 border-none">
                                <TableHead className="font-bold py-4">User</TableHead>
                                <TableHead className="font-bold py-4">Role</TableHead>
                                <TableHead className="font-bold py-4">Join Date</TableHead>
                                <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode='popLayout'>
                                {filteredUsers.map((u) => (
                                    <TableRow key={u.id} className="group border-b border-muted/30 hover:bg-muted/10 transition-colors">
                                        <TableCell className="py-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground">{u.name}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">{u.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize font-bold">
                                                {u.role?.name || 'Staff'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-muted-foreground text-sm">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenModal(u)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {currentUser?.id !== u.id && (
                                                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Invite/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border"
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="text-xl font-bold">{editingUser ? 'Edit Member' : 'Invite New Member'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-muted-foreground"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-10" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-10" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assign Role</Label>
                                        <Select value={formData.role_id} onValueChange={(v) => setFormData({...formData, role_id: v ?? ""})}>
                                            <SelectTrigger className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-primary" />
                                                    <SelectValue placeholder="Select a role" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{editingUser ? 'New Password (Optional)' : 'Default Password'}</Label>
                                        <Input type="password" placeholder="Min 8 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    </div>
                                </div>
                                <div className="p-6 bg-muted/50 flex gap-3">
                                    <Button type="submit" className="flex-1" disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        {editingUser ? 'Update Member' : 'Send Invitation'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
