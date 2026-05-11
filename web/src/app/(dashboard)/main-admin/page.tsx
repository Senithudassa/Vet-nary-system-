"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Clock, GitMerge, Target, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { mockClinics, mockPlatformStats } from "@/lib/mock-data";
import { toast } from "sonner";

export default function MainAdminPage() {
    const stats = mockPlatformStats;

    const [activeClinics, setActiveClinics] = useState(
        mockClinics.filter(c => c.status === "APPROVED").map(c => ({
            id: c.id,
            name: c.name,
            status: "Online" as "Online" | "Offline",
            errors: Math.floor(Math.random() * 3),
            lastSync: `${Math.floor(Math.random() * 10) + 1} mins ago`,
        }))
    );

    const [pendingCommits, setPendingCommits] = useState([
        { id: "PR-892", commitMsg: "Update CL-01 Platform Discount Tier to 20%", author: "Admin Sarah", time: "10:15 AM", diff: "+5% Discount", risk: "Low" as const },
        { id: "PR-893", commitMsg: "Reset Password for Dr. Silva (CL-02)", author: "Admin Mike", time: "11:05 AM", diff: "Auth Token Reset", risk: "High" as const },
        { id: "PR-894", commitMsg: "Add new vaccination type to formulary", author: "Admin Sarah", time: "11:30 AM", diff: "New Row", risk: "Low" as const },
    ]);

    const [approvedDeployments, setApprovedDeployments] = useState([
        { id: "PR-890", commitMsg: "Fix timezone bug in VetBook timeline UI", author: "System Auto", approvedBy: "Main Admin" },
        { id: "PR-891", commitMsg: "Revoke API access for suspended CL-03", author: "Admin Sarah", approvedBy: "Main Admin" },
    ]);

    const handleAuthorize = (id: string) => {
        const commit = pendingCommits.find(c => c.id === id);
        if (commit) {
            setPendingCommits(prev => prev.filter(c => c.id !== id));
            setApprovedDeployments(prev => [...prev, {
                id: commit.id,
                commitMsg: commit.commitMsg,
                author: commit.author,
                approvedBy: "Main Admin",
            }]);
            toast.success(`${id} authorized and queued for deployment.`);
        }
    };

    const handleReject = (id: string) => {
        setPendingCommits(prev => prev.filter(c => c.id !== id));
        toast.error(`${id} has been rejected.`);
    };

    const handleEmergencyHalt = () => {
        setApprovedDeployments([]);
        toast.warning("Emergency halt activated. All pending deployments cleared.");
    };

    return (
        <ProtectedRoute allowedRoles={["main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Control (Main Admin)</h1>
                        <p className="text-muted-foreground mt-1">Tech support, branch monitoring, and Git-style daily deploy authorizations.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleEmergencyHalt}>
                            <AlertTriangle className="mr-2 h-4 w-4" /> Emergency Halt Deploy
                        </Button>
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
                            <p className="text-xs text-muted-foreground mt-1">{approvedDeployments.length} updates queued for push</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Health</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeClinics.filter(c => c.status === "Online").length} / {activeClinics.length} Online
                            </div>
                            <p className="text-xs text-amber-600 mt-1">
                                {activeClinics.reduce((sum, c) => sum + c.errors, 0)} non-critical errors reported
                            </p>
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
                                            <TableCell className="font-medium">{clinic.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={clinic.status === "Online" ? "default" : "secondary"} className={clinic.status === "Online" ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {clinic.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={clinic.errors > 0 ? "text-amber-500 font-bold" : "text-muted-foreground"}>{clinic.errors}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => toast.info(`Impersonating ${clinic.name} dashboard...`)}>
                                                    Impersonate View
                                                </Button>
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
                                Review system configuration changes proposed by Minor Admins. Approved changes are merged into the 12:00 PM deploy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {pendingCommits.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-6">No pending commits. All clear!</p>
                                ) : pendingCommits.map((commit) => (
                                    <div key={commit.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="font-mono text-[10px]">{commit.id}</Badge>
                                                    <span className="font-medium text-sm">{commit.commitMsg}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Authored by {commit.author} at {commit.time}</p>
                                            </div>
                                            <Badge variant={commit.risk === "High" ? "destructive" : "secondary"}>{commit.risk} Risk</Badge>
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono text-green-600 border border-green-500/20">
                                            {commit.diff}
                                        </div>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => handleReject(commit.id)}>Reject</Button>
                                            <Button size="sm" className="h-8 bg-primary" onClick={() => handleAuthorize(commit.id)}>Authorize Merge</Button>
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
                                {approvedDeployments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                            No deployments queued. All cleared by emergency halt or no commits approved.
                                        </TableCell>
                                    </TableRow>
                                ) : approvedDeployments.map((deploy) => (
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
