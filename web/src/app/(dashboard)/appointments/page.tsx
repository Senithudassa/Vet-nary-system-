"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { mockAppointments, mockPets, mockClinics } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<AppointmentStatus, { color: string; icon: React.ReactNode }> = {
    PENDING: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <Clock className="h-3 w-3" /> },
    CONFIRMED: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <CheckCircle2 className="h-3 w-3" /> },
    COMPLETED: { color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="h-3 w-3" /> },
    CANCELLED: { color: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="h-3 w-3" /> },
    NO_SHOW: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isBookOpen, setIsBookOpen] = useState(false);

    const [form, setForm] = useState({ clinicId: "", petId: "", date: "", reason: "" });

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return appointments;
        return appointments.filter(a => a.status === statusFilter);
    }, [appointments, statusFilter]);

    const stats = useMemo(() => ({
        total: appointments.length,
        pending: appointments.filter(a => a.status === "PENDING").length,
        confirmed: appointments.filter(a => a.status === "CONFIRMED").length,
        completed: appointments.filter(a => a.status === "COMPLETED").length,
    }), [appointments]);

    const handleBook = () => {
        if (!form.clinicId || !form.petId || !form.date) {
            toast.error("Clinic, pet, and date are required.");
            return;
        }

        const clinic = mockClinics.find(c => c.id === form.clinicId);
        const pet = mockPets.find(p => p.id === form.petId);

        const newApt: Appointment = {
            id: `apt-${Date.now()}`,
            clinicId: form.clinicId,
            ownerId: pet?.ownerId || "",
            petId: form.petId,
            date: new Date(form.date).toISOString(),
            status: "PENDING",
            reason: form.reason || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            clinic: { name: clinic?.name || "" },
            owner: pet?.owner ? { firstName: pet.owner.firstName, lastName: pet.owner.lastName } : undefined,
            pet: pet ? { name: pet.name, species: pet.species } : undefined,
        };

        setAppointments(prev => [newApt, ...prev]);
        toast.success(`Appointment booked for ${pet?.name} at ${clinic?.name}`);
        setForm({ clinicId: "", petId: "", date: "", reason: "" });
        setIsBookOpen(false);
    };

    const updateStatus = (id: string, newStatus: AppointmentStatus) => {
        setAppointments(prev => prev.map(a =>
            a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
        ));
        toast.success(`Appointment status updated to ${newStatus}`);
    };

    return (
        <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground mt-1">Manage and schedule patient appointments.</p>
                    </div>
                    <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" /> Book Appointment</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Book New Appointment</DialogTitle>
                                <DialogDescription>Schedule an appointment for a patient at a clinic.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Clinic *</Label>
                                    <Select value={form.clinicId} onValueChange={v => setForm(f => ({ ...f, clinicId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select clinic" /></SelectTrigger>
                                        <SelectContent>
                                            {mockClinics.filter(c => c.status === "APPROVED").map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pet *</Label>
                                    <Select value={form.petId} onValueChange={v => setForm(f => ({ ...f, petId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                                        <SelectContent>
                                            {mockPets.filter(p => p.isActive).map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.species}) — {p.owner?.firstName} {p.owner?.lastName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date & Time *</Label>
                                    <Input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Textarea placeholder="Reason for visit..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBookOpen(false)}>Cancel</Button>
                                <Button onClick={handleBook}>Book Appointment</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-600">{stats.pending}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{stats.completed}</div></CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle>All Appointments</CardTitle>
                                <CardDescription>View and manage scheduled visits.</CardDescription>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Pet</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No appointments found.</TableCell>
                                    </TableRow>
                                ) : filtered.map(apt => (
                                    <TableRow key={apt.id}>
                                        <TableCell className="text-sm font-medium">
                                            {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            <br />
                                            <span className="text-xs text-muted-foreground">{new Date(apt.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                                        </TableCell>
                                        <TableCell className="font-medium">{apt.pet?.name} <span className="text-muted-foreground text-xs">({apt.pet?.species})</span></TableCell>
                                        <TableCell className="text-sm">{apt.owner?.firstName} {apt.owner?.lastName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{apt.clinic?.name}</TableCell>
                                        <TableCell className="text-sm max-w-[200px] truncate">{apt.reason || "—"}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[apt.status].color}`}>
                                                {STATUS_CONFIG[apt.status].icon}
                                                {apt.status.replace("_", " ")}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {apt.status === "PENDING" && (
                                                <div className="flex gap-1 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "CONFIRMED")}>Confirm</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => updateStatus(apt.id, "CANCELLED")}>Cancel</Button>
                                                </div>
                                            )}
                                            {apt.status === "CONFIRMED" && (
                                                <div className="flex gap-1 justify-end">
                                                    <Button size="sm" onClick={() => updateStatus(apt.id, "COMPLETED")}>Complete</Button>
                                                    <Button size="sm" variant="secondary" onClick={() => updateStatus(apt.id, "NO_SHOW")}>No Show</Button>
                                                </div>
                                            )}
                                            {(apt.status === "COMPLETED" || apt.status === "CANCELLED" || apt.status === "NO_SHOW") && (
                                                <span className="text-xs text-muted-foreground">Finalized</span>
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
