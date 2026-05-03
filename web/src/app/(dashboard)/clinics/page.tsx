"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Building2, CheckCircle2, XCircle, Clock, MapPin, Phone } from "lucide-react";
import { mockClinics } from "@/lib/mock-data";
import type { Clinic, ClinicStatus } from "@/lib/types";
import { toast } from "sonner";

const STATUS_BADGE: Record<ClinicStatus, { variant: "default" | "secondary" | "destructive"; className: string }> = {
    APPROVED: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
    PENDING: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
    REJECTED: { variant: "destructive", className: "" },
};

export default function ClinicsPage() {
    const [clinics, setClinics] = useState<Clinic[]>(mockClinics);

    const pending = useMemo(() => clinics.filter(c => c.status === "PENDING"), [clinics]);
    const approved = useMemo(() => clinics.filter(c => c.status === "APPROVED"), [clinics]);
    const rejected = useMemo(() => clinics.filter(c => c.status === "REJECTED"), [clinics]);

    const updateStatus = (id: string, newStatus: ClinicStatus) => {
        setClinics(prev => prev.map(c =>
            c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
        ));
        const clinic = clinics.find(c => c.id === id);
        toast.success(`${clinic?.name} has been ${newStatus.toLowerCase()}.`);
    };

    const ClinicTable = ({ items, showActions }: { items: Clinic[]; showActions: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Clinic Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                            No clinics in this category.
                        </TableCell>
                    </TableRow>
                ) : items.map(clinic => (
                    <TableRow key={clinic.id}>
                        <TableCell className="font-medium">{clinic.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                            <div className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {clinic.address}
                            </div>
                        </TableCell>
                        <TableCell className="text-sm">
                            {clinic.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {clinic.phone}
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{clinic.operatingHours || "—"}</TableCell>
                        <TableCell>
                            <Badge variant={STATUS_BADGE[clinic.status].variant} className={STATUS_BADGE[clinic.status].className}>
                                {clinic.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(clinic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        {showActions && (
                            <TableCell className="text-right">
                                {clinic.status === "PENDING" && (
                                    <div className="flex gap-1 justify-end">
                                        <Button size="sm" onClick={() => updateStatus(clinic.id, "APPROVED")}>
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => updateStatus(clinic.id, "REJECTED")}>
                                            <XCircle className="h-3 w-3 mr-1" /> Reject
                                        </Button>
                                    </div>
                                )}
                                {clinic.status === "REJECTED" && (
                                    <Button size="sm" variant="outline" onClick={() => updateStatus(clinic.id, "APPROVED")}>
                                        Re-approve
                                    </Button>
                                )}
                                {clinic.status === "APPROVED" && (
                                    <Button size="sm" variant="secondary" onClick={() => updateStatus(clinic.id, "REJECTED")}>
                                        Suspend
                                    </Button>
                                )}
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <ProtectedRoute allowedRoles={["main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clinic Management</h1>
                    <p className="text-muted-foreground mt-1">Review, approve, and manage clinic registrations on the platform.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{clinics.length}</div></CardContent>
                    </Card>
                    <Card className="border-amber-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-600">{pending.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{approved.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-600">{rejected.length}</div></CardContent>
                    </Card>
                </div>

                {/* Pending Queue - highlighted */}
                {pending.length > 0 && (
                    <Card className="border-amber-500/30 shadow-sm">
                        <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b">
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                                Pending Approval Queue ({pending.length})
                            </CardTitle>
                            <CardDescription>These clinics are awaiting your review. Approved clinics will appear on the mobile app.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ClinicTable items={pending} showActions={true} />
                        </CardContent>
                    </Card>
                )}

                {/* All Clinics Tabs */}
                <Tabs defaultValue="approved">
                    <TabsList>
                        <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({clinics.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="approved">
                        <Card>
                            <CardContent className="pt-6">
                                <ClinicTable items={approved} showActions={true} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="rejected">
                        <Card>
                            <CardContent className="pt-6">
                                <ClinicTable items={rejected} showActions={true} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="all">
                        <Card>
                            <CardContent className="pt-6">
                                <ClinicTable items={clinics} showActions={true} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
