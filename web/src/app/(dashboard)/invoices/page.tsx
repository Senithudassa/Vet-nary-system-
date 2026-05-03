"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Receipt, Plus, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { mockInvoices, mockClinics, mockUsers } from "@/lib/mock-data";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { toast } from "sonner";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [form, setForm] = useState({ clinicId: "", ownerId: "", amount: "" });

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return invoices;
        return invoices.filter(i => i.status === statusFilter);
    }, [invoices, statusFilter]);

    const stats = useMemo(() => ({
        total: invoices.length,
        pending: invoices.filter(i => i.status === "PENDING").length,
        paid: invoices.filter(i => i.status === "PAID").length,
        totalRevenue: invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0),
        outstandingAmount: invoices.filter(i => i.status === "PENDING").reduce((sum, i) => sum + i.amount, 0),
    }), [invoices]);

    const handleCreate = () => {
        if (!form.clinicId || !form.ownerId || !form.amount) {
            toast.error("Clinic, owner, and amount are required.");
            return;
        }

        const clinic = mockClinics.find(c => c.id === form.clinicId);
        const owner = mockUsers.find(u => u.id === form.ownerId);

        const newInv: Invoice = {
            id: `inv-${Date.now()}`,
            clinicId: form.clinicId,
            ownerId: form.ownerId,
            amount: parseFloat(form.amount),
            status: "PENDING",
            issuedAt: new Date().toISOString(),
            clinic: { name: clinic?.name || "" },
            owner: owner ? { firstName: owner.firstName, lastName: owner.lastName, email: owner.email } : undefined,
        };

        setInvoices(prev => [newInv, ...prev]);
        toast.success(`Invoice for Rs. ${parseFloat(form.amount).toLocaleString()} created successfully.`);
        setForm({ clinicId: "", ownerId: "", amount: "" });
        setIsCreateOpen(false);
    };

    const markPaid = (id: string) => {
        setInvoices(prev => prev.map(i =>
            i.id === id ? { ...i, status: "PAID" as InvoiceStatus, paidAt: new Date().toISOString() } : i
        ));
        toast.success("Invoice marked as paid.");
    };

    const customers = mockUsers.filter(u => u.role === "CUSTOMER");
    const approvedClinics = mockClinics.filter(c => c.status === "APPROVED");

    return (
        <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoices & Billing</h1>
                        <p className="text-muted-foreground mt-1">Generate invoices and track payment statuses.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" /> Generate Invoice</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Generate New Invoice</DialogTitle>
                                <DialogDescription>Create an invoice for a completed service.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Clinic *</Label>
                                    <Select value={form.clinicId} onValueChange={v => setForm(f => ({ ...f, clinicId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select clinic" /></SelectTrigger>
                                        <SelectContent>
                                            {approvedClinics.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pet Owner *</Label>
                                    <Select value={form.ownerId} onValueChange={v => setForm(f => ({ ...f, ownerId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                                        <SelectContent>
                                            {customers.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.accountNumber})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (Rs.) *</Label>
                                    <Input type="number" placeholder="e.g. 4500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate}>Generate Invoice</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Rs. {stats.outstandingAmount.toLocaleString()} outstanding</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{stats.paid}</div></CardContent>
                    </Card>
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary-foreground">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary-foreground/70" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</div></CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle>Invoice Records</CardTitle>
                                <CardDescription>All generated invoices and their payment statuses.</CardDescription>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Issued</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell>
                                    </TableRow>
                                ) : filtered.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-sm">{inv.id.toUpperCase()}</TableCell>
                                        <TableCell className="text-sm">{inv.clinic?.name}</TableCell>
                                        <TableCell className="text-sm">{inv.owner?.firstName} {inv.owner?.lastName}</TableCell>
                                        <TableCell className="font-semibold">Rs. {inv.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={inv.status === "PAID" ? "default" : "secondary"} className={inv.status === "PAID" ? "bg-green-500 hover:bg-green-600" : "bg-amber-100 text-amber-800"}>
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</TableCell>
                                        <TableCell className="text-right">
                                            {inv.status === "PENDING" ? (
                                                <Button size="sm" onClick={() => markPaid(inv.id)}>
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Paid
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Completed</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
