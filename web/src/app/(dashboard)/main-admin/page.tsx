"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, ShieldCheck, Clock, GitMerge, FileType2, Target, AlertTriangle } from "lucide-react"
import { ProtectedRoute } from "@/components/ui/protected-route"

export default function MainAdminPage() {

    // Tech Support Live View
    const activeClinics = [
        { id: "CL-01", name: "River Edge Vet", status: "Online", errors: 0, lastSync: "2 mins ago" },
        { id: "CL-02", name: "Pet Care Center", status: "Online", errors: 2, lastSync: "1 min ago" },
        { id: "CL-04", name: "City Vet Clinic", status: "Offline", errors: 0, lastSync: "4 hrs ago" },
    ]

    // Git-style Authorization Queue
    const pendingCommits = [
        { id: "PR-892", commitMsg: "Update CL-01 Platform Discount Tier to 20%", author: "Admin Sarah", time: "10:15 AM", diff: "+5% Discount", risk: "Low" },
        { id: "PR-893", commitMsg: "Reset Password for Dr. Silva (CL-02)", author: "Admin Mike", time: "11:05 AM", diff: "Auth Token Reset", risk: "High" },
    ]

    // 12:00 PM Deployment Queue
    const approvedDeployments = [
        { id: "PR-890", commitMsg: "Fix timezone bug in VetBook timeline UI", author: "System Auto", approvedBy: "Main Admin Dev" },
        { id: "PR-891", commitMsg: "Revoke API access for suspended CL-03", author: "Admin Sarah", approvedBy: "Main Admin Dev" },
    ]

    return (
        <ProtectedRoute allowedRoles={["main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Control (Main Admin)</h1>
                        <p className="text-muted-foreground mt-1">Tech support, branch impersonation, and Git-style daily deploy authorizations.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => console.log("Emergency Halt")}><AlertTriangle className="mr-2 h-4 w-4" /> Emergency Halt Deploy</Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Commits</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-primary-foreground/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCommits.length} Awaiting Approval</div>
                            <p className="text-xs text-primary-foreground/80 mt-1">From Minor Admins</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Next Daily Deploy</CardTitle>
                            <Clock className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">12:00 PM</div>
                            <p className="text-xs text-muted-foreground mt-1">2 updates queued for push</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Health</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">38 / 42 Online</div>
                            <p className="text-xs text-amber-600 mt-1">2 non-critical errors reported</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">

                    {/* Tech Support Live View & Impersonation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Tech Support Live View</CardTitle>
                            <CardDescription>
                                Monitor branch statuses. If a Vet calls with an issue, securely impersonate their dashboard to troubleshoot.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Errors</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeClinics.map((clinic) => (
                                        <TableRow key={clinic.id}>
                                            <TableCell className="font-medium">{clinic.id} - {clinic.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={clinic.status === 'Online' ? 'default' : 'secondary'} className={clinic.status === 'Online' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                    {clinic.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={clinic.errors > 0 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}>{clinic.errors}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => console.log(`Impersonating ${clinic.id}`)}>Impersonate View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Git-Style Authorization Queue */}
                    <Card className="border-primary/20 shadow-sm">
                        <CardHeader className="bg-primary/5 pb-4 border-b">
                            <CardTitle className="flex items-center gap-2"><GitMerge className="h-5 w-5 text-primary" /> Commit Authorizations</CardTitle>
                            <CardDescription>
                                Review system configuration changes proposed by Minor Admins ("Pull Requests"). Approved changes are merged into the 12:00 PM deploy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {pendingCommits.map((commit) => (
                                    <div key={commit.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="font-mono text-[10px]">{commit.id}</Badge>
                                                    <span className="font-medium text-sm">{commit.commitMsg}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Authored by {commit.author} at {commit.time}</p>
                                            </div>
                                            <Badge variant={commit.risk === 'High' ? 'destructive' : 'secondary'}>{commit.risk} Risk</Badge>
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono text-green-600 border border-green-500/20">
                                            {commit.diff}
                                        </div>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => console.log(`Reject ${commit.id}`)}>Reject</Button>
                                            <Button size="sm" className="h-8 bg-primary" onClick={() => console.log(`Authorize Merge ${commit.id}`)}>Authorize Merge</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* 12:00 PM Deployment Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Scheduled 12:00 PM Deployment Log</CardTitle>
                        <CardDescription>
                            These authorized commits are queued and will automatically push to live Vet branches at exactly 12:00 PM today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Commit ID</TableHead>
                                    <TableHead>Commit Message</TableHead>
                                    <TableHead>Original Author</TableHead>
                                    <TableHead className="text-right">Authorized By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {approvedDeployments.map((deploy) => (
                                    <TableRow key={deploy.id}>
                                        <TableCell className="font-medium font-mono text-muted-foreground">{deploy.id}</TableCell>
                                        <TableCell className="font-semibold">{deploy.commitMsg}</TableCell>
                                        <TableCell>{deploy.author}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{deploy.approvedBy}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
