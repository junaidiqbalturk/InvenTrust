"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    date: string;
    currency: string;
    total_amount: number;
    notes: string;
    client: {
        company_name: string;
        address: string;
        phone: string;
        email: string;
    };
    items: InvoiceItem[];
}

export default function InvoicePrintPage() {
    const params = useParams();
    const invoiceId = params.id;
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { data } = await api.get(`/invoices/${invoiceId}`);
                setInvoice(data);
                // Trigger print dialog automatically after a short delay to ensure render
                setTimeout(() => {
                    window.print();
                }, 500);
            } catch (error) {
                console.error("Failed to fetch invoice", error);
            } finally {
                setLoading(false);
            }
        };

        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>;
    }

    if (!invoice) {
        return <div className="p-8 text-center text-red-500">Failed to load invoice.</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(amount);
    };

    return (
        <div className="bg-white text-black min-h-screen flex flex-col items-center">
            {/* Print Controls - Hidden during actual print */}
            <div className="print:hidden w-full bg-zinc-100 p-4 flex justify-between items-center border-b">
                <span className="text-zinc-600 text-sm">Print Preview View</span>
                <Button onClick={() => window.print()} variant="default" size="sm">
                    <Printer className="w-4 h-4 mr-2" /> Print PDF
                </Button>
            </div>

            {/* A4 Sized Print Container */}
            <div className="w-full max-w-[210mm] mx-auto p-12 print:p-0 print:max-w-none bg-white font-sans text-sm">

                {/* Header Container */}
                <div className="flex justify-between items-start mb-12 border-b-4 border-zinc-900 pb-8 print:border-zinc-900">
                    <div>
                        <Logo size="lg" className="mb-4" />
                        <div className="inline-block bg-primary text-white print:text-white print:bg-primary px-3 py-1 rounded">
                            <p className="text-xs font-bold uppercase tracking-widest">Tax Invoice</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-5xl font-black text-primary print:text-primary uppercase tracking-tighter mb-4">Invoice</h2>
                        <div className="bg-zinc-50 print:bg-zinc-50 border border-zinc-200 rounded-xl p-4 inline-block text-left min-w-[200px]">
                            <div className="flex justify-between mb-2">
                                <span className="text-zinc-500 text-xs font-bold uppercase">Invoice No</span>
                                <span className="font-bold text-zinc-900">#{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500 text-xs font-bold uppercase">Date</span>
                                <span className="font-bold text-zinc-900">{invoice.date}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="flex justify-between mb-12 bg-zinc-50 print:bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-primary print:text-primary uppercase tracking-wider mb-2">Billed To</h3>
                        <p className="font-black text-zinc-900 text-2xl mb-2">{invoice.client?.company_name}</p>
                        {invoice.client?.address && <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">{invoice.client.address}</p>}
                        {invoice.client?.phone && <p className="text-zinc-600 mt-2 font-medium">{invoice.client.phone}</p>}
                        {invoice.client?.email && <p className="text-zinc-600 font-medium">{invoice.client.email}</p>}
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-primary print:text-primary uppercase tracking-wider mb-2">Payment Details</h3>
                        <div className="flex flex-col gap-2 items-end">
                            <p className="text-zinc-600 inline-flex items-center gap-2">Currency: <span className="font-bold text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200">{invoice.currency}</span></p>
                            <p className="text-zinc-600 mt-1 inline-flex items-center gap-2">Due Date: <span className="font-bold text-zinc-900">Upon Receipt</span></p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-zinc-900 text-white print:bg-zinc-900 print:text-white rounded-t-lg">
                            <th className="py-4 px-4 font-bold text-left rounded-tl-lg">Description</th>
                            <th className="py-4 px-4 font-bold text-right">Quantity</th>
                            <th className="py-4 px-4 font-bold text-right">Unit Price</th>
                            <th className="py-4 px-4 font-bold text-right rounded-tr-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, index) => (
                            <tr key={item.id || index} className="border-b-2 border-zinc-100 hover:bg-zinc-50 print:hover:bg-transparent transition-colors">
                                <td className="py-5 px-4 text-zinc-900 font-medium">{item.description}</td>
                                <td className="py-5 px-4 text-right text-zinc-700">{item.quantity}</td>
                                <td className="py-5 px-4 text-right text-zinc-700">{formatCurrency(item.unit_price)}</td>
                                <td className="py-5 px-4 text-right font-bold text-zinc-900">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                        {(!invoice.items || invoice.items.length === 0) && (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-zinc-400 italic">No line items recorded on this invoice</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2 md:w-2/5 p-6 bg-zinc-50 print:bg-zinc-50 rounded-2xl border border-zinc-200 text-right">
                        <div className="flex justify-between py-2 border-b-2 border-zinc-200">
                            <span className="text-zinc-600 font-bold uppercase text-xs tracking-wider">Subtotal</span>
                            <span className="font-semibold text-lg">{formatCurrency(invoice.total_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 mt-2">
                            <span className="font-black text-xl text-zinc-900 uppercase">Total Due</span>
                            <span className="font-black text-3xl text-primary">{formatCurrency(invoice.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes/Footer */}
                {invoice.notes && (
                    <div className="mb-12 page-break-inside-avoid">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Notes & Instructions</h3>
                        <p className="text-zinc-700 bg-primary/5 print:bg-zinc-50 p-6 rounded-xl border-l-4 border-primary whitespace-pre-wrap">
                            {invoice.notes}
                        </p>
                    </div>
                )}

                <div className="text-center text-zinc-400 font-medium text-xs mt-24 pt-8 border-t-2 border-zinc-100">
                    <p>Thank you for your business. Generated by Automated Systems.</p>
                </div>
            </div>

            {/* Global style for printing to hide body margins and hide header/footers added by browsers */}
            <style jsx global>{`
                @media print {
                    @page { size: auto; margin: 0mm; }
                    body { margin: 1cm; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
