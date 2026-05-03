"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Users, Building2, Calendar, DollarSign, TrendingUp, PawPrint, LifeBuoy, Receipt } from "lucide-react";
import { mockPlatformStats, mockUsers, mockClinics, mockAppointments, mockPets, mockInvoices, mockSupportTickets } from "@/lib/mock-data";

export default function PlatformStatsPage() {
    const stats = mockPlatformStats;

    const recentUsers = mockUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const roleDistribution = {
        admins: mockUsers.filter(u => u.role === "MAIN_ADMIN" || u.role === "MINOR_ADMIN").length,
        vets: mockUsers.filter(u => u.role === "VET").length,
        customers: mockUsers.filter(u => u.role === "CUSTOMER").length,
    };

    const appointmentsByStatus = {
        pending: mockAppointments.filter(a => a.status === "PENDING").length,
        confirmed: mockAppointments.filter(a => a.status === "CONFIRMED").length,
        completed: mockAppointments.filter(a => a.status === "COMPLETED").length,
        cancelled: mockAppointments.filter(a => a.status === "CANCELLED").length,
    };

    const openTickets = mockSupportTickets.filter(t => t.status !== "RESOLVED").length;
    const activePets = mockPets.filter(p => p.isActive).length;
    const pendingInvoices = mockInvoices.filter(i => i.status === "PENDING").length;

    return (
        <ProtectedRoute allowedRoles={["main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Statistics</h1>
                    <p className="text-muted-foreground mt-1">High-level overview of the VetNary platform health and metrics.</p>
                </div>

                {/* Primary Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
                            <Users className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.usersCount}</div>
                            <p className="text-xs text-white/70 mt-1">Across all roles</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Active Clinics</CardTitle>
                            <Building2 className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.clinicsCount}</div>
                            <p className="text-xs text-white/70 mt-1">Approved & operating</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Appointments</CardTitle>
                            <Calendar className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.appointmentsCount}</div>
                            <p className="text-xs text-white/70 mt-1">Total scheduled</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-white/70 mt-1">Total collected</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registered Pets</CardTitle>
                            <PawPrint className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activePets}</div>
                            <p className="text-xs text-muted-foreground">Active registrations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                            <LifeBuoy className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{openTickets}</div>
                            <p className="text-xs text-muted-foreground">Needing attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <Receipt className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{pendingInvoices}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Clinics</CardTitle>
                            <Building2 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {mockClinics.filter(c => c.status === "PENDING").length}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Role Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Distribution</CardTitle>
                            <CardDescription>Breakdown of users by their assigned roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: "Administrators", count: roleDistribution.admins, color: "bg-violet-500", total: stats.usersCount },
                                    { label: "Veterinarians", count: roleDistribution.vets, color: "bg-emerald-500", total: stats.usersCount },
                                    { label: "Customers", count: roleDistribution.customers, color: "bg-blue-500", total: stats.usersCount },
                                ].map(({ label, count, color, total }) => (
                                    <div key={label} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{label}</span>
                                            <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(count / total) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments by Status</CardTitle>
                            <CardDescription>Current appointment pipeline breakdown.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: "Pending", count: appointmentsByStatus.pending, color: "bg-amber-500" },
                                    { label: "Confirmed", count: appointmentsByStatus.confirmed, color: "bg-blue-500" },
                                    { label: "Completed", count: appointmentsByStatus.completed, color: "bg-green-500" },
                                    { label: "Cancelled", count: appointmentsByStatus.cancelled, color: "bg-red-500" },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${color}`} />
                                            <span className="font-medium text-sm">{label}</span>
                                        </div>
                                        <span className="text-xl font-bold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recently Registered Users</CardTitle>
                            <CardDescription>The 5 most recent user registrations on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-muted">
                                                {user.role.replace("_", " ")}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
