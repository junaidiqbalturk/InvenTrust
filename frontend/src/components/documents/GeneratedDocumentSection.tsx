"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { 
    FileText, 
    Download, 
    Trash2, 
    RefreshCcw, 
    Plus, 
    Loader2, 
    CheckCircle2, 
    Clock, 
    FileDown
} from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface GeneratedDocument {
    id: number;
    document_number: string;
    document_type: string;
    created_at: string;
    file_path: string;
    user?: { name: string };
}

interface Props {
    referenceType: "Invoice" | "ExportOrder" | "PurchaseOrder";
    referenceId: number;
    availableTypes: { label: string; value: string }[];
}

export function GeneratedDocumentSection({ referenceType, referenceId, availableTypes }: Props) {
    const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingType, setGeneratingType] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, [referenceId]);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get("/generated-documents", {
                params: { reference_type: referenceType, reference_id: referenceId }
            });
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (type: string) => {
        setGeneratingType(type);
        try {
            await api.post("/generated-documents/generate", {
                document_type: type,
                reference_type: referenceType,
                reference_id: referenceId
            });
            toast.success("Document generated successfully!");
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Generation failed");
        } finally {
            setGeneratingType(null);
        }
    };

    const handleDownload = async (id: number, number: string) => {
        try {
            const response = await api.get(`/generated-documents/${id}/download`, {
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Download failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this generated document?")) return;
        try {
            await api.delete(`/generated-documents/${id}`);
            toast.success("Document deleted");
            setDocuments(documents.filter(d => d.id !== id));
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleRegenerate = async (id: number) => {
        try {
            await api.post(`/generated-documents/${id}/regenerate`);
            toast.success("Document updated successfully!");
            fetchDocuments();
        } catch (error) {
            toast.error("Regeneration failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        Automated Documents
                    </h3>
                    <p className="text-xs text-muted-foreground">Generate and manage official trade documentation.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableTypes.map((type) => (
                        <Button 
                            key={type.value}
                            size="sm" 
                            variant="secondary"
                            className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 transition-all font-semibold"
                            onClick={() => handleGenerate(type.value)}
                            disabled={generatingType !== null}
                        >
                            {generatingType === type.value ? (
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-3.5 w-3.5 mr-2" />
                            )}
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[180px]">Doc Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                    Scanning archives...
                                </TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2 opacity-60">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">No documents generated yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : documents.map((doc) => (
                            <TableRow key={doc.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="font-mono font-bold text-xs text-primary">{doc.document_number}</TableCell>
                                <TableCell className="font-medium text-foreground">{doc.document_type}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(doc.created_at).toLocaleString()}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                            title="Download PDF"
                                            onClick={() => handleDownload(doc.id, doc.document_number)}
                                        >
                                            <FileDown className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                                            title="Regenerate"
                                            onClick={() => handleRegenerate(doc.id)}
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                            title="Delete"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
