// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const itemSchema = z.object({
    item_name: z.string().min(1, "Item name requires"),
    qty: z.coerce.number().min(1),
    price: z.coerce.number().min(0),
});

const formSchema = z.object({
    client_id: z.string().min(1, "Client is required"),
    date: z.string().min(1, "Date is required"),
    currency: z.string(),
    discount: z.coerce.number().min(0).optional(),
    tax: z.coerce.number().min(0).optional(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
});

export default function CreateInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: "",
            date: new Date().toISOString().split('T')[0],
            currency: "PKR",
            discount: 0,
            tax: 0,
            items: [{ item_name: "", qty: 1, price: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    });

    const watchItems = form.watch("items");
    const subtotal = watchItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const watchDiscount = form.watch("discount") || 0;
    const watchTax = form.watch("tax") || 0;
    const total = subtotal - watchDiscount + watchTax;

    useEffect(() => {
        api.get("/clients").then(res => setClients(res.data)).catch(console.error);
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorMsg("");
        try {
            await api.post("/invoices", values);
            window.location.href = "/invoices";
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Failed to create invoice");
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-12">
            <div className="space-y-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/invoices">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
                    </div>
                </div>

                <Card className="border border-border shadow-sm overflow-hidden rounded-xl bg-card">
                    <CardHeader className="bg-muted/40 border-b border-border">
                        <CardTitle className="text-foreground flex items-center gap-3 text-2xl font-semibold">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="text-primary text-xl">#</span>
                            </div>
                            Create Invoice
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1 text-sm">Generate a new bill for a client.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errorMsg && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">{errorMsg}</div>}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">

                                <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 border-b border-border pb-2">Primary Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField control={form.control} name="client_id" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
                                                <Combobox value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <ComboboxInput placeholder="Search client name..." />
                                                    </FormControl>
                                                    <ComboboxContent className="max-h-[300px] z-[100]">
                                                        <ComboboxEmpty>No client found.</ComboboxEmpty>
                                                        <ComboboxList>
                                                            {clients.map((c) => (
                                                                <ComboboxItem key={c.id} value={c.id.toString()}>
                                                                    {c.company_name}
                                                                </ComboboxItem>
                                                            ))}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="date" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="currency" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select currency" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PKR">PKR</SelectItem>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="EUR">EUR</SelectItem>
                                                        <SelectItem value="GBP">GBP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-6">
                                    <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Line Items</h3>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-end bg-card p-4 rounded-lg border border-border">
                                            <FormField control={form.control} name={`items.${index}.item_name`} render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl><Input placeholder="Service or product" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`items.${index}.qty`} render={({ field }) => (
                                                <FormItem className="w-full sm:w-24">
                                                    <FormLabel>Qty</FormLabel>
                                                    <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                                                <FormItem className="w-full sm:w-32">
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <div className="w-full sm:w-24 pb-2 font-medium text-right sm:text-left">
                                                {(watchItems[index]?.qty * watchItems[index]?.price || 0).toFixed(2)}
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="mb-0.5 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)} disabled={fields.length === 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ item_name: "", qty: 1, price: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Item
                                    </Button>
                                </div>

                                <div className="flex justify-end pt-6 border-t">
                                    <div className="w-full sm:w-64 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground w-16">Discount</span>
                                            <FormField control={form.control} name="discount" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" step="0.01" min="0" className="h-8 text-right" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground w-16">Tax</span>
                                            <FormField control={form.control} name="tax" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" step="0.01" min="0" className="h-8 text-right" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                            <span>Total</span>
                                            <span>{form.watch("currency")} {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-border">
                                    <Link href="/invoices">
                                        <Button variant="outline" type="button" className="h-12 px-8 font-medium">Cancel</Button>
                                    </Link>
                                    <Button type="submit" className="h-12 px-8 font-bold text-white bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]">
                                        Generate Invoice
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

