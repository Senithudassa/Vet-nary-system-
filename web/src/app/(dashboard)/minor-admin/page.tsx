"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Headset, Users, Search, Send, FileType2, GitCommitHorizontal, CheckCircle2 } from "lucide-react"
import { ProtectedRoute } from "@/components/ui/protected-route"

export default function MinorAdminPage() {

    // Banking-style account routing
    const supportTickets = [
        { id: "TK-402", user: "Senith U.", aNumber: "VN-8429", issue: "Discrepancy in vaccine bill", priority: "High", status: "New" },
        { id: "TK-403", user: "Kasun P.", aNumber: "VN-3310", issue: "Cannot add second pet", priority: "Low", status: "Working" },
        { id: "TK-404", user: "Nadeeka S.", aNumber: "VN-1102", issue: "Requesting X-Rays from Kandy Clinic", priority: "Medium", status: "Routed to Vet" },
    ]

    const clinicTiers = [
        { id: "CL-01", name: "River Edge Vet", volume: 142, hashedTarget: "8a4f...2c1e", discountTier: "Gold (15%)" },
        { id: "CL-02", name: "Pet Care Center", volume: 89, hashedTarget: "9b3a...1f4v", discountTier: "Silver (10%)" },
        { id: "CL-04", name: "City Vet Clinic", volume: 34, hashedTarget: "2f2e...9a12", discountTier: "Standard (0%)" },
    ]

    const stagedChanges = [
        { desc: "Increase Platform Discount for CL-01 to 20%", author: "Admin Sarah", time: "10:15 AM", status: "Awaiting Main Admin" },
        { desc: "Reset VN-3310 Password", author: "Admin Mike", time: "09:45 AM", status: "Approved, Queued for 12:00 PM" },
    ]

    return (
        <ProtectedRoute allowedRoles={["minor_admin", "main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Center (Minor Admin)</h1>
                        <p className="text-muted-foreground mt-1">Resolve customer tickets, evaluate clinic tiers, and propose system changes.</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                        <Button variant="outline" onClick={() => console.log("Active Status toggled")}><Headset className="h-4 w-4 mr-2" /> Active Status</Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
                            <Users className="h-4 w-4 text-primary-foreground/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">14 Unassigned</div>
                            <p className="text-xs text-primary-foreground/80 mt-1">3 High Priority</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Routed</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">8 to Vets</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting independent branch resolution</p>
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
                            Address customer issues. If it requires clinic intervention, route the ticket directly to the Vet Branch using the User's A/C Number.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Ticket No.</TableHead>
                                    <TableHead>A/C Number</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Issue / Request</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Assign / Route</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {supportTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium text-muted-foreground">{ticket.id}</TableCell>
                                        <TableCell className="font-mono font-semibold">{ticket.aNumber}</TableCell>
                                        <TableCell>{ticket.user}</TableCell>
                                        <TableCell>{ticket.issue}</TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.priority === 'High' ? 'destructive' : ticket.priority === 'Medium' ? 'default' : 'outline'}>{ticket.priority}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === 'Routed to Vet' ? 'secondary' : 'default'} className={ticket.status === 'New' ? 'bg-green-500 hover:bg-green-600' : ''}>{ticket.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => console.log(`Resolve ${ticket.id}`)}>Resolve</Button>
                                            <Button size="sm" onClick={() => console.log(`Route ${ticket.id} to Branch`)}>Route to Branch</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">

                    {/* Financial Tiers (Hashed Data) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Clinic Financial Performance (Read-Only)</CardTitle>
                            <CardDescription>
                                Assess clinic volume against hashed target metrics to evaluate platform discount tiers. Raw financials are cryptographically hidden.
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
                                                <Badge variant={tier.discountTier.includes('Gold') ? 'default' : tier.discountTier.includes('Silver') ? 'secondary' : 'outline'}>
                                                    {tier.discountTier}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Proposed Changes Staging (Git Style) */}
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
                                {stagedChanges.map((change) => (
                                    <div key={change.desc} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm font-mono text-primary">{change.desc}</p>
                                            <span className="text-xs text-muted-foreground">{change.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Proposed by {change.author}</span>
                                            <span className={`font-semibold flex items-center gap-1 ${change.status.includes('Approved') ? 'text-green-600' : 'text-amber-600'}`}>
                                                {change.status.includes('Approved') && <CheckCircle2 className="h-3 w-3" />}
                                                {change.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => console.log("Propose new config update")}>Propose New Configuration Change</Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </ProtectedRoute>
    )
}
