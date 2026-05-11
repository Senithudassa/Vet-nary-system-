"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headset, Users, Send, FileType2, GitCommitHorizontal, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { mockSupportTickets, mockClinics } from "@/lib/mock-data";
import type { SupportTicket, TicketStatus } from "@/lib/types";
import { toast } from "sonner";

export default function MinorAdminPage() {
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
        mockSupportTickets.filter(t => t.status !== "RESOLVED")
    );

    const clinicTiers = mockClinics
        .filter(c => c.status === "APPROVED")
        .map(c => ({
            id: c.id,
            name: c.name,
            volume: Math.floor(Math.random() * 150) + 30,
            hashedTarget: `${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
            discountTier: Math.random() > 0.6 ? "Gold (15%)" : Math.random() > 0.3 ? "Silver (10%)" : "Standard (0%)",
        }));

    const [stagedChanges, setStagedChanges] = useState([
        { desc: "Increase Platform Discount for CL-01 to 20%", author: "Admin Sarah", time: "10:15 AM", status: "Awaiting Main Admin" },
        { desc: "Reset VN-3310 Password", author: "Admin Mike", time: "09:45 AM", status: "Approved, Queued for 12:00 PM" },
    ]);

    const handleResolve = (id: string) => {
        setSupportTickets(prev => prev.map(t =>
            t.id === id ? { ...t, status: "RESOLVED" as TicketStatus, updatedAt: new Date().toISOString() } : t
        ));
        toast.success(`Ticket ${id} resolved.`);
    };

    const handleRoute = (id: string) => {
        setSupportTickets(prev => prev.map(t =>
            t.id === id ? { ...t, status: "IN_PROGRESS" as TicketStatus, updatedAt: new Date().toISOString() } : t
        ));
        toast.success(`Ticket ${id} routed to the target branch.`);
    };

    const handleProposeChange = () => {
        const newChange = {
            desc: `Config change proposed at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
            author: "You",
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            status: "Awaiting Main Admin",
        };
        setStagedChanges(prev => [...prev, newChange]);
        toast.success("Configuration change proposed. Awaiting Main Admin approval.");
    };

    return (
        <ProtectedRoute allowedRoles={["minor_admin", "main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Center (Minor Admin)</h1>
                        <p className="text-muted-foreground mt-1">Resolve customer tickets, evaluate clinic tiers, and propose system changes.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                        <Button variant="outline" onClick={() => toast.info("Status: Active and available for incoming tickets.")}>
                            <Headset className="h-4 w-4 mr-2" /> Active Status
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                            <Users className="h-4 w-4 text-primary-foreground/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === "OPEN").length} Unresolved</div>
                            <p className="text-xs text-primary-foreground/80 mt-1">{supportTickets.filter(t => t.status === "OPEN").length} need attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{supportTickets.filter(t => t.status === "IN_PROGRESS").length} Routed</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting branch resolution</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Your Daily Commits</CardTitle>
                            <GitCommitHorizontal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stagedChanges.length} Proposed</div>
                            <p className="text-xs text-muted-foreground mt-1">System pushes at exact 12:00 PM</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Ticketing Queue */}
                <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="bg-primary/5 pb-4 border-b">
                        <CardTitle>Customer Request Queue</CardTitle>
                        <CardDescription>
                            Address customer issues. If it requires clinic intervention, route the ticket directly to the Vet Branch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Ticket No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Issue / Request</TableHead>
                                    <TableHead>Target Clinic</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supportTickets.filter(t => t.status !== "RESOLVED").length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">All tickets resolved!</TableCell>
                                    </TableRow>
                                ) : supportTickets.filter(t => t.status !== "RESOLVED").map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium text-muted-foreground">{ticket.id.toUpperCase()}</TableCell>
                                        <TableCell>{ticket.owner?.firstName} {ticket.owner?.lastName}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{ticket.targetClinic?.name || "General"}</TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"} className={ticket.status === "OPEN" ? "bg-red-500 hover:bg-red-600" : ""}>
                                                {ticket.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleResolve(ticket.id)}>Resolve</Button>
                                            {ticket.status === "OPEN" && (
                                                <Button size="sm" onClick={() => handleRoute(ticket.id)}>Route to Branch</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    {/* Financial Tiers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Financial Performance (Read-Only)</CardTitle>
                            <CardDescription>
                                Assess clinic volume against hashed target metrics to evaluate platform discount tiers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Clinic</TableHead>
                                        <TableHead>Vol (30d)</TableHead>
                                        <TableHead>Target Checksum</TableHead>
                                        <TableHead className="text-right">Granted Tier</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clinicTiers.map((tier) => (
                                        <TableRow key={tier.id}>
                                            <TableCell className="font-medium">{tier.name}</TableCell>
                                            <TableCell>{tier.volume}</TableCell>
                                            <TableCell className="font-mono text-muted-foreground text-xs"><FileType2 className="inline h-3 w-3 mr-1" />{tier.hashedTarget}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={tier.discountTier.includes("Gold") ? "default" : tier.discountTier.includes("Silver") ? "secondary" : "outline"}>
                                                    {tier.discountTier}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Proposed Changes Staging */}
                    <Card className="border-amber-500/30">
                        <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
                            <CardTitle className="text-amber-800 dark:text-amber-500 flex items-center gap-2">
                                <GitCommitHorizontal className="h-5 w-5" /> Pending Commits (Staging)
                            </CardTitle>
                            <CardDescription>
                                Changes you make to system configurations require Main Admin approval. All approved edits go live for Vets at 12:00 PM.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {stagedChanges.map((change, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm font-mono text-primary">{change.desc}</p>
                                            <span className="text-xs text-muted-foreground">{change.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Proposed by {change.author}</span>
                                            <span className={`font-semibold flex items-center gap-1 ${change.status.includes("Approved") ? "text-green-600" : "text-amber-600"}`}>
                                                {change.status.includes("Approved") && <CheckCircle2 className="h-3 w-3" />}
                                                {change.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="outline" className="w-full mt-4 border-dashed" onClick={handleProposeChange}>
                                Propose New Configuration Change
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    )
}
