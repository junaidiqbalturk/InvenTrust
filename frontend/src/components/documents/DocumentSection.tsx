"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, FileText, UploadCloud, Loader2 } from "lucide-react";

interface Document {
    id: number;
    file_name: string;
    original_name: string;
    type: string;
    mime_type: string;
    size: number;
    created_at: string;
    user?: {
        name: string;
    };
}

interface DocumentSectionProps {
    documentableType: string;
    documentableId: number;
}

const DOCUMENT_TYPES = [
    "Bill of Lading",
    "Packing List",
    "Commercial Invoice",
    "Proforma Invoice",
    "Letter of Credit",
    "Insurance Certificate",
    "Customs Declaration",
    "Supplier Invoice",
    "Shipping Document",
    "Contract",
    "Other"
];

export function DocumentSection({ documentableType, documentableId }: DocumentSectionProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form state
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState<string>("");

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/documents', {
                params: {
                    documentable_type: documentableType,
                    documentable_id: documentableId
                }
            });
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentableId && documentableType) {
            fetchDocuments();
        }
    }, [documentableId, documentableType]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !docType) return;

        // 10MB limit validation
        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", docType);
        formData.append("documentable_type", documentableType);
        formData.append("documentable_id", documentableId.toString());

        setUploading(true);
        try {
            await api.post('/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsUploadOpen(false);
            setFile(null);
            setDocType("");
            fetchDocuments();
        } catch (error: any) {
            console.error("Upload failed:", error);
            alert(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.original_name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file.");
        }
    };

    const handleDelete = async (docId: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await api.delete(`/documents/${docId}`);
            fetchDocuments();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete document.");
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Attached Documents
                </h3>
                <Button size="sm" onClick={() => setIsUploadOpen(true)} className="h-8">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload File
                </Button>
            </div>

            <div className="border border-border rounded-xl bg-card w-full overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 opacity-50" />
                                    Loading documents...
                                </TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                        <p>No documents attached yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map(doc => (
                                <TableRow key={doc.id} className="group hover:bg-muted/30">
                                    <TableCell className="font-medium text-primary">
                                        <div className="flex items-center gap-2 line-clamp-1 max-w-[200px]" title={doc.original_name}>
                                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            {doc.original_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            {doc.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                                        {formatBytes(doc.size)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{new Date(doc.created_at).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">by {doc.user?.name || 'System'}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleDownload(doc)} title="Download">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)} title="Delete">
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

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-primary" />
                            Upload Document
                        </DialogTitle>
                        <DialogDescription>
                            Attach a relevant PDF, Image, or Office file. (Max 10MB)
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleUpload} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="docType">Document Type <span className="text-destructive">*</span></Label>
                                <Select value={docType} onValueChange={(v) => setDocType(v || "")} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOCUMENT_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="file">Select File <span className="text-destructive">*</span></Label>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center text-center">
                                    <Input 
                                        id="file" 
                                        type="file" 
                                        className="hidden" 
                                        required 
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <Label htmlFor="file" className="cursor-pointer w-full flex flex-col items-center gap-2">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                                            <UploadCloud className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-medium text-primary">Click to select</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {file ? file.name : "or drag and drop"}
                                        </p>
                                        {file && (
                                            <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                                                {formatBytes(file.size)} - Selected
                                            </p>
                                        )}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploading || !file || !docType} className="shadow-sm">
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : "Upload File"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
