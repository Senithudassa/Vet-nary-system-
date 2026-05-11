"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { LifeBuoy, MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { mockSupportTickets } from "@/lib/mock-data";
import type { SupportTicket, TicketStatus } from "@/lib/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<TicketStatus, { color: string; icon: React.ReactNode }> = {
    OPEN: { color: "bg-red-100 text-red-800 border-red-300", icon: <AlertCircle className="h-3 w-3" /> },
    IN_PROGRESS: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <Clock className="h-3 w-3" /> },
    RESOLVED: { color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return tickets;
        return tickets.filter(t => t.status === statusFilter);
    }, [tickets, statusFilter]);

    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === "OPEN").length,
        inProgress: tickets.filter(t => t.status === "IN_PROGRESS").length,
        resolved: tickets.filter(t => t.status === "RESOLVED").length,
    }), [tickets]);

    const updateStatus = (id: string, newStatus: TicketStatus) => {
        setTickets(prev => prev.map(t =>
            t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
        ));
        toast.success(`Ticket status updated to ${newStatus.replace("_", " ").toLowerCase()}.`);
    };

    return (
        <ProtectedRoute allowedRoles={["main_admin", "minor_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
                    <p className="text-muted-foreground mt-1">Track and manage customer support requests.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                    </Card>
                    <Card className="border-red-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-700">Open</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-600">{stats.open}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{stats.resolved}</div></CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle>All Support Tickets</CardTitle>
                                <CardDescription>Review and respond to customer issues.</CardDescription>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Target Clinic</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tickets found.</TableCell>
                                    </TableRow>
                                ) : filtered.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-mono text-sm">{ticket.id.toUpperCase()}</TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                                        <TableCell className="text-sm">{ticket.owner?.firstName} {ticket.owner?.lastName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{ticket.targetClinic?.name || "General"}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[ticket.status].color}`}>
                                                {STATUS_CONFIG[ticket.status].icon}
                                                {ticket.status.replace("_", " ")}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setViewTicket(ticket)}>
                                                            <MessageSquare className="h-3 w-3 mr-1" /> View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>{viewTicket?.subject}</DialogTitle>
                                                            <DialogDescription>
                                                                Ticket {viewTicket?.id.toUpperCase()} · {viewTicket?.owner?.firstName} {viewTicket?.owner?.lastName}
                                                                {viewTicket?.targetClinic && ` · ${viewTicket.targetClinic.name}`}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        {viewTicket && (
                                                            <div className="space-y-4">
                                                                <div className="bg-muted p-4 rounded-lg text-sm">
                                                                    {viewTicket.description}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <span className="font-medium">Current Status:</span>
                                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[viewTicket.status].color}`}>
                                                                        {STATUS_CONFIG[viewTicket.status].icon}
                                                                        {viewTicket.status.replace("_", " ")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <DialogFooter className="gap-2">
                                                            {viewTicket?.status === "OPEN" && (
                                                                <Button onClick={() => { updateStatus(viewTicket.id, "IN_PROGRESS"); setViewTicket(null); }}>
                                                                    Start Working
                                                                </Button>
                                                            )}
                                                            {viewTicket?.status === "IN_PROGRESS" && (
                                                                <Button onClick={() => { updateStatus(viewTicket.id, "RESOLVED"); setViewTicket(null); }}>
                                                                    Mark Resolved
                                                                </Button>
                                                            )}
                                                            {viewTicket?.status === "RESOLVED" && (
                                                                <Button variant="outline" onClick={() => { updateStatus(viewTicket.id, "OPEN"); setViewTicket(null); }}>
                                                                    Reopen
                                                                </Button>
                                                            )}
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                {ticket.status === "OPEN" && (
                                                    <Button size="sm" onClick={() => updateStatus(ticket.id, "IN_PROGRESS")}>Start</Button>
                                                )}
                                                {ticket.status === "IN_PROGRESS" && (
                                                    <Button size="sm" variant="secondary" onClick={() => updateStatus(ticket.id, "RESOLVED")}>Resolve</Button>
                                                )}
                                            </div>
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
