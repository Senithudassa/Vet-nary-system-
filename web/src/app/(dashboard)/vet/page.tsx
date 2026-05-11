"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Stethoscope, AlertCircle, Banknote, Users, Activity, FileText } from "lucide-react";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { toast } from "sonner";
import { appointmentService, apiFetch } from "@/app/services/appointment.service";
import { clinicService, ClinicDetails } from "@/app/services/clinic.service";
import { invoiceService, Invoice } from "@/app/services/invoice.service";

export default function VetPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [clinic, setClinic] = useState<ClinicDetails | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [queue, setQueue] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [vaccinations, setVaccinations] = useState<any[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const profile = await appointmentService.getMyProfile();
                if (!profile.clinicId) {
                    setIsLoading(false);
                    return;
                }
                const clinicId = profile.clinicId;

                const [clinicData, invData, queueData, aptData, recordsData] = await Promise.all([
                    clinicService.getClinicDetails(clinicId),
                    invoiceService.getClinicInvoices(clinicId),
                    appointmentService.getQueue(clinicId),
                    appointmentService.getClinicAppointments(clinicId),
                    apiFetch<{ medicalRecords: any[], vaccinations: any[] }>(`/clinics/${clinicId}/records`).catch(() => ({ medicalRecords: [], vaccinations: [] }))
                ]);

                setClinic(clinicData);
                setInvoices(invData);
                setQueue(queueData);
                setAppointments(aptData);
                setMedicalRecords(recordsData.medicalRecords || []);
                setVaccinations(recordsData.vaccinations || []);
            } catch (error) {
                console.error("Dashboard load error", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const dailyRevenue = useMemo(() => {
        return invoices
            .filter(i => i.status === "PAID")
            .reduce((sum, i) => sum + i.amount, 0);
    }, [invoices]);

    const pendingWork = useMemo(() => {
        const now = new Date();
        return vaccinations
            .filter(v => v.nextDueDate)
            .map(v => {
                const due = new Date(v.nextDueDate!);
                const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    ...v,
                    petName: v.pet?.name || "Unknown Pet",
                    issue: `${v.vaccineName} — ${daysUntil > 0 ? "Upcoming" : "Overdue"}`,
                    days: -daysUntil, // positive = overdue
                    severity: daysUntil < 0 ? "High" : daysUntil < 30 ? "Medium" : "Low",
                };
            })
            .sort((a, b) => b.days - a.days);
    }, [vaccinations]);

    const todayAppointments = useMemo(() => {
        const today = new Date().toDateString();
        return appointments.filter(a => new Date(a.date).toDateString() === today);
    }, [appointments]);

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={["vet", "main_admin"]}>
                <div className="flex h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={["vet", "main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Vet Branch: {clinic?.name || "Your Clinic"}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {clinic?.address || "Overview of your clinic's operations and patients."}
                        </p>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Rs. {dailyRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">From paid invoices</p>
                        </CardContent>
                    </Card>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{todayAppointments.length}</div>
                                    <p className="text-xs text-muted-foreground">Scheduled for today</p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Today's Appointments</DialogTitle>
                                <DialogDescription>List of all appointments scheduled for today.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Pet</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todayAppointments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No appointments today</TableCell>
                                            </TableRow>
                                        ) : todayAppointments.map(apt => (
                                            <TableRow key={apt.id}>
                                                <TableCell>{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                <TableCell>{apt.pet?.name || "Unknown"}</TableCell>
                                                <TableCell>{apt.owner?.firstName} {apt.owner?.lastName}</TableCell>
                                                <TableCell><Badge>{apt.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer bg-zinc-900 text-zinc-50 border-zinc-800 hover:bg-zinc-800 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-50">Live Queue</CardTitle>
                                    <Users className="h-4 w-4 text-zinc-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{queue.length} Waiting</div>
                                    <p className="text-xs text-zinc-400">Patients currently in queue</p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Live Queue</DialogTitle>
                                <DialogDescription>Patients waiting to be seen.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Arrived</TableHead>
                                            <TableHead>Pet</TableHead>
                                            <TableHead>Owner</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queue.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center">Queue is empty</TableCell>
                                            </TableRow>
                                        ) : queue.map(q => (
                                            <TableRow key={q.id}>
                                                <TableCell>{new Date(q.createdAt).toLocaleTimeString()}</TableCell>
                                                <TableCell>{q.pet?.name || "Unknown"}</TableCell>
                                                <TableCell>{q.owner?.firstName} {q.owner?.lastName}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    {/* Patient Pending Work (Vaccinations) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Clinical Work</CardTitle>
                            <CardDescription>Upcoming or overdue patient vaccinations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingWork.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No pending work found.</p>
                                ) : pendingWork.slice(0, 5).map((work: any, idx: number) => (
                                    <Dialog key={idx}>
                                        <DialogTrigger asChild>
                                            <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className={`mt-0.5 h-5 w-5 ${work.severity === "High" ? "text-red-500" : work.severity === "Medium" ? "text-amber-500" : "text-blue-500"}`} />
                                                    <div>
                                                        <p className="font-semibold text-sm">{work.petName}</p>
                                                        <p className="text-xs text-muted-foreground">{work.issue}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-medium">{work.days > 0 ? `${work.days} days overdue` : `In ${Math.abs(work.days)} days`}</p>
                                                    <span className="text-xs text-primary hover:underline">View Details</span>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Vaccination Details</DialogTitle>
                                                <DialogDescription>Information about the required vaccination.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-3 text-sm">
                                                <p><strong>Pet:</strong> {work.petName}</p>
                                                <p><strong>Vaccine:</strong> {work.vaccineName}</p>
                                                <p><strong>Batch:</strong> {work.batchNumber}</p>
                                                <p><strong>Due Date:</strong> {new Date(work.nextDueDate).toLocaleDateString()}</p>
                                                <p><strong>Status:</strong> {work.days > 0 ? "Overdue" : "Upcoming"}</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Medical Records */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Medical Records</CardTitle>
                            <CardDescription>
                                Latest diagnoses and treatments added to VetBook.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Pet</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {medicalRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No recent medical records.</TableCell>
                                        </TableRow>
                                    ) : medicalRecords.slice(0, 5).map((record: any) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="text-sm">{new Date(record.recordDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{record.pet?.name || "Unknown"}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">{record.diagnosis}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Medical Record Details</DialogTitle>
                                                            <DialogDescription>Diagnosis and treatment info.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-3 text-sm">
                                                            <p><strong>Pet:</strong> {record.pet?.name || "Unknown"}</p>
                                                            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                                            <p><strong>Treatment:</strong> {record.treatment || "N/A"}</p>
                                                            <p><strong>Prescription:</strong> {record.prescription || "N/A"}</p>
                                                            <p><strong>Notes:</strong> {record.notes || "N/A"}</p>
                                                            <p><strong>Date:</strong> {new Date(record.recordDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pending Invoices */}
                    <Card className="lg:col-span-2 border-primary/20 shadow-sm">
                        <CardHeader className="bg-primary/5 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-primary" />
                                <CardTitle>Pending Invoices</CardTitle>
                            </div>
                            <CardDescription className="pt-2">
                                Unpaid invoices for clinic services.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Issued</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.filter(i => i.status === "PENDING").length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No pending invoices. All clear!</TableCell>
                                        </TableRow>
                                    ) : invoices.filter(i => i.status === "PENDING").slice(0, 5).map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-mono text-muted-foreground">{inv.id.substring(0, 8).toUpperCase()}</TableCell>
                                            <TableCell>{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-semibold">Rs. {inv.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">{inv.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">Details</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Invoice Details</DialogTitle>
                                                            <DialogDescription>Review invoice information.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-3 text-sm">
                                                            <p><strong>Invoice ID:</strong> {inv.id}</p>
                                                            <p><strong>Amount:</strong> Rs. {inv.amount}</p>
                                                            <p><strong>Status:</strong> {inv.status}</p>
                                                            <p><strong>Issued At:</strong> {new Date(inv.issuedAt).toLocaleString()}</p>
                                                            {inv.appointmentId && <p><strong>Appointment ID:</strong> {inv.appointmentId}</p>}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}

