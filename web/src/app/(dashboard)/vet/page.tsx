"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Stethoscope, AlertCircle, Banknote, Inbox, FileWarning } from "lucide-react"
import { ProtectedRoute } from "@/components/ui/protected-route"

export default function VetPage() {
    const expenses = [
        { category: "Medical Supplies", amount: "Rs. 45,000", budget: "Rs. 50,000", status: "Under Budget" },
        { category: "Staff Salaries", amount: "Rs. 120,000", budget: "Rs. 120,000", status: "On Target" },
        { category: "Utility & Overheads", amount: "Rs. 18,500", budget: "Rs. 15,000", status: "Over Budget" },
    ]

    const pendingWork = [
        { pet: "Max (Golden Retriever)", issue: "Vaccination Overdue", days: 4, severity: "High" },
        { pet: "Luna (Persian)", issue: "Upcoming Booster", days: -7, severity: "Medium" },
        { pet: "Rocky (German Shepherd)", issue: "Diet Plan Review", days: 1, severity: "Low" },
    ]

    const customerRequests = [
        { id: "REQ-901", accountNo: "VN-8429", subject: "Prescription Refill Error", from: "Minor Admin Center", status: "Open" },
        { id: "REQ-902", accountNo: "VN-3310", subject: "X-Ray Report Missing", from: "Minor Admin Center", status: "In Progress" },
    ]

    return (
        <ProtectedRoute allowedRoles={["vet", "main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Vet Branch: River Edge Hospital</h1>
                        <p className="text-muted-foreground mt-1">Manage your independent branch operations, finances, and routed requests.</p>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Rs. 42,500</div>
                            <p className="text-xs text-muted-foreground">Collected by Assistant Till</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Branch Expenses (MTD)</CardTitle>
                            <FileWarning className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rs. 183,500</div>
                            <p className="text-xs text-muted-foreground">92% of monthly budget</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 text-zinc-50 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-50">Routed Requests</CardTitle>
                            <Inbox className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customerRequests.length} Unread</div>
                            <p className="text-xs text-zinc-400">Escalated from Contact Center</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">

                    {/* Independent Financials (Read-only data, hashed on backend) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Operating Expenses & Budget</CardTitle>
                            <CardDescription>
                                Your branch financials. Note: Main admins can view these hashed totals to calculate your platform discount tiers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Spent</TableHead>
                                        <TableHead>Allocated</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((exp) => (
                                        <TableRow key={exp.category}>
                                            <TableCell className="font-medium">{exp.category}</TableCell>
                                            <TableCell>{exp.amount}</TableCell>
                                            <TableCell className="text-muted-foreground">{exp.budget}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={exp.status === 'Over Budget' ? 'destructive' : exp.status === 'Under Budget' ? 'default' : 'secondary'}>
                                                    {exp.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Patient Pending Work */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Clinical Work</CardTitle>
                            <CardDescription>
                                Missed or upcoming patient vaccinations and reviews.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingWork.map((work) => (
                                    <div key={work.pet} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className={`mt-0.5 h-5 w-5 ${work.severity === 'High' ? 'text-red-500' : work.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                                            <div>
                                                <p className="font-semibold text-sm">{work.pet}</p>
                                                <p className="text-xs text-muted-foreground">{work.issue}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium">{work.days > 0 ? `${work.days} days overdue` : `In ${Math.abs(work.days)} days`}</p>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => console.log(`Send Reminder for ${work.pet}`)}>Send Reminder</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Request Inbox */}
                    <Card className="lg:col-span-2 border-primary/20 shadow-sm">
                        <CardHeader className="bg-primary/5 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <Inbox className="h-5 w-5 text-primary" />
                                <CardTitle>Customer Contact Center Requests</CardTitle>
                            </div>
                            <CardDescription className="pt-2">
                                Tickets routed dynamically to your branch from the Minor Admin remote center based on User Account Numbers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Ticket ID</TableHead>
                                        <TableHead>Account No.</TableHead>
                                        <TableHead>Problem Subject</TableHead>
                                        <TableHead>Routed From</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customerRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium text-muted-foreground">{req.id}</TableCell>
                                            <TableCell className="font-mono font-semibold">{req.accountNo}</TableCell>
                                            <TableCell>{req.subject}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{req.from}</TableCell>
                                            <TableCell>
                                                <Badge variant={req.status === 'Open' ? 'destructive' : 'secondary'}>{req.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => console.log(`Respond to ${req.id}`)}>Respond</Button>
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
