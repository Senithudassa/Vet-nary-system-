"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Receipt, Plus, DollarSign, CheckCircle2, Clock, Loader2, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { invoiceService, Invoice } from "@/app/services/invoice.service";
import { appointmentService, Appointment } from "@/app/services/appointment.service";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [clinicId, setClinicId] = useState("");
    const [userRole, setUserRole] = useState("");

    // Details view state
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [form, setForm] = useState({ appointmentId: "", amount: "" });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await appointmentService.getMyProfile();
                setUserRole(profile.role);
                const cId = profile.clinicId ?? "";
                if (cId && (profile.role === "VET" || profile.role === "vet")) {
                    setClinicId(cId);
                    const [invs, apts] = await Promise.all([
                        invoiceService.getClinicInvoices(cId),
                        appointmentService.getClinicAppointments(cId)
                    ]);
                    setInvoices(Array.isArray(invs) ? invs : []);
                    setAppointments(Array.isArray(apts) ? apts : []);
                }
            } catch (err: unknown) {
                toast.error((err as Error).message ?? "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return invoices;
        return invoices.filter(i => i.status === statusFilter);
    }, [invoices, statusFilter]);

    const stats = useMemo(() => ({
        total: invoices.length,
        pending: invoices.filter(i => i.status === "PENDING").length,
        paid: invoices.filter(i => i.status === "PAID").length,
        totalRevenue: invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + Number(i.amount), 0),
        outstandingAmount: invoices.filter(i => i.status === "PENDING").reduce((sum, i) => sum + Number(i.amount), 0),
    }), [invoices]);

    const availableAppointments = useMemo(() => {
        return appointments.filter(a => a.status !== "COMPLETED");
    }, [appointments]);

    const handleCreate = async () => {
        if (!form.appointmentId || !form.amount) {
            toast.error("Appointment and amount are required.");
            return;
        }

        const selectedAppt = appointments.find(a => a.id === form.appointmentId);
        if (!selectedAppt) {
            toast.error("Selected appointment not found.");
            return;
        }

        setCreateLoading(true);
        try {
            const newInv = await invoiceService.createInvoice({
                clinicId: clinicId,
                ownerId: selectedAppt.ownerId,
                appointmentId: form.appointmentId,
                amount: parseFloat(form.amount)
            });
            setInvoices(prev => [newInv, ...prev]);
            toast.success(`Invoice created successfully.`);
            setForm({ appointmentId: "", amount: "" });
            setIsCreateOpen(false);
        } catch (err: unknown) {
            toast.error((err as Error).message ?? "Failed to create invoice.");
        } finally {
            setCreateLoading(false);
        }
    };

    const markPaid = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation(); // prevent opening details view
        try {
            await invoiceService.payInvoice(id);
            setInvoices(prev => prev.map(i =>
                i.id === id ? { ...i, status: "PAID", paidAt: new Date().toISOString() } : i
            ));
            toast.success("Invoice marked as paid.");
            if (selectedInvoice && selectedInvoice.id === id) {
                setSelectedInvoice({ ...selectedInvoice, status: "PAID", paidAt: new Date().toISOString() });
            }
        } catch (err: unknown) {
            toast.error((err as Error).message ?? "Failed to mark as paid.");
        }
    };

    const isVet = userRole === "VET" || userRole === "vet";

    return (
        <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoices & Billing</h1>
                        <p className="text-muted-foreground mt-1">Generate invoices and track payment statuses.</p>
                    </div>
                    {isVet && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={!clinicId || loading}><Plus className="h-4 w-4 mr-2" /> Generate Invoice</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Generate New Invoice</DialogTitle>
                                    <DialogDescription>Create an invoice for an ongoing appointment.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Appointment *</Label>
                                        <Select value={form.appointmentId} onValueChange={v => setForm(f => ({ ...f, appointmentId: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select appointment" /></SelectTrigger>
                                            <SelectContent>
                                                {availableAppointments.length === 0 ? (
                                                    <SelectItem value="none" disabled>No active appointments</SelectItem>
                                                ) : (
                                                    availableAppointments.map(a => (
                                                        <SelectItem key={a.id} value={a.id}>
                                                            {a.pet?.name} - {new Date(a.date).toLocaleDateString()}
                                                        </SelectItem>
                                                    ))
                                                )}
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
                                    <Button onClick={handleCreate} disabled={createLoading}>
                                        {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Generate Invoice
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
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
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Pet</TableHead>
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
                                    ) : filtered.map(inv => {
                                        const apt = appointments.find(a => a.id === inv.appointmentId);
                                        return (
                                            <TableRow 
                                                key={inv.id} 
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => {
                                                    setSelectedInvoice(inv);
                                                    setIsViewOpen(true);
                                                }}
                                            >
                                                <TableCell className="font-mono text-sm">{inv.id.substring(0, 8).toUpperCase()}</TableCell>
                                                <TableCell className="text-sm">{apt?.pet?.name ?? "—"}</TableCell>
                                                <TableCell className="text-sm">{apt?.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : "—"}</TableCell>
                                                <TableCell className="font-semibold">Rs. {Number(inv.amount).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.status === "PAID" ? "default" : "secondary"} className={inv.status === "PAID" ? "bg-green-500 hover:bg-green-600" : "bg-amber-100 text-amber-800"}>
                                                        {inv.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</TableCell>
                                                <TableCell className="text-right">
                                                    {inv.status === "PENDING" ? (
                                                        <Button size="sm" onClick={(e) => markPaid(inv.id, e)}>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Paid
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Completed</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Details View Dialog */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Invoice Details</DialogTitle>
                            <DialogDescription>Information about the invoice and the linked appointment.</DialogDescription>
                        </DialogHeader>
                        {selectedInvoice && (() => {
                            const apt = appointments.find(a => a.id === selectedInvoice.appointmentId);
                            return (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">Invoice {selectedInvoice.id.substring(0, 8).toUpperCase()}</h3>
                                            <p className="text-sm text-muted-foreground">Issued on {new Date(selectedInvoice.issuedAt).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant={selectedInvoice.status === "PAID" ? "default" : "secondary"} className={selectedInvoice.status === "PAID" ? "bg-green-500 hover:bg-green-600" : "bg-amber-100 text-amber-800"}>
                                            {selectedInvoice.status}
                                        </Badge>
                                    </div>
                                    
                                    <div className="bg-muted p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">Amount</span>
                                            <span className="text-xl font-bold">Rs. {Number(selectedInvoice.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2"/>Owner</span>
                                            <span className="text-sm font-medium">{apt?.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : "—"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground flex items-center"><FileText className="h-4 w-4 mr-2"/>Paid At</span>
                                            <span className="text-sm font-medium">{selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString() : "—"}</span>
                                        </div>
                                    </div>

                                    {apt && (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold border-b pb-2">Appointment Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Date</p>
                                                    <p className="text-sm font-medium">{new Date(apt.date).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Pet</p>
                                                    <p className="text-sm font-medium">{apt.pet?.name} ({apt.pet?.species})</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-muted-foreground">Reason</p>
                                                    <p className="text-sm font-medium">{apt.reason ?? "—"}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-muted-foreground">Status</p>
                                                    <Badge variant="outline" className="mt-1">{apt.status}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedInvoice.status === "PENDING" && (
                                        <div className="pt-4 border-t">
                                            <Button className="w-full" onClick={() => markPaid(selectedInvoice.id)}>
                                                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Paid
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
