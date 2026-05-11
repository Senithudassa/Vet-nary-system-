"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Users, Building2, Calendar, DollarSign, PawPrint, LifeBuoy, Receipt, Loader2, UserPlus } from "lucide-react";
import { adminService, AdminStats } from "@/app/services/admin.service";
import { toast } from "sonner";

export default function PlatformStatsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (error) {
                toast.error("Failed to fetch platform stats");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <ProtectedRoute allowedRoles={["main_admin"]}>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ProtectedRoute>
        );
    }

    const appointmentsByStatus = {
        pending: stats.appointmentsByStatus?.PENDING || 0,
        confirmed: stats.appointmentsByStatus?.CONFIRMED || 0,
        completed: stats.appointmentsByStatus?.COMPLETED || 0,
        cancelled: stats.appointmentsByStatus?.CANCELLED || 0,
    };

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
                            <div className="text-3xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-white/70 mt-1">Across all roles</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Active Clients</CardTitle>
                            <Building2 className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalActiveClients}</div>
                            <p className="text-xs text-white/70 mt-1">Approved & operating</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Appointments</CardTitle>
                            <Calendar className="h-5 w-5 text-white/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalAppointments}</div>
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
                            <div className="text-2xl font-bold">{stats.totalRegisteredPets}</div>
                            <p className="text-xs text-muted-foreground">Active registrations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                            <LifeBuoy className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.totalOpenTickets}</div>
                            <p className="text-xs text-muted-foreground">Needing attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <Receipt className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pendingInvoices}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Vets</CardTitle>
                            <UserPlus className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {stats.pendingVets}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6">
                    {/* Appointment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments by Status</CardTitle>
                            <CardDescription>Current appointment pipeline breakdown.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                {[
                                    { label: "Pending", count: appointmentsByStatus.pending, color: "bg-amber-500" },
                                    { label: "Confirmed", count: appointmentsByStatus.confirmed, color: "bg-blue-500" },
                                    { label: "Completed", count: appointmentsByStatus.completed, color: "bg-green-500" },
                                    { label: "Cancelled", count: appointmentsByStatus.cancelled, color: "bg-red-500" },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className="flex flex-col p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${color}`} />
                                            <span className="font-medium text-sm text-muted-foreground">{label}</span>
                                        </div>
                                        <span className="text-3xl font-bold">{count}</span>
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
