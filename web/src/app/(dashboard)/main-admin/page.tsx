"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarClock,
  DollarSign,
  PawPrint,
  Ticket,
  FileClock,
  Stethoscope,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type PlatformStats = {
  totalUsers: number;
  totalActiveClients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalRegisteredPets: number;
  totalOpenTickets: number;
  pendingInvoices: number;
  pendingVets: number;
  appointmentsByStatus: {
    COMPLETED: number;
    PENDING: number;
    CONFIRMED: number;
  };
};

type UserSummary = {
  id: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
};

type ClinicSummary = {
  id: string;
  status?: string;
  createdAt?: string;
};

type TicketSummary = {
  id: string;
  status?: string;
  createdAt?: string;
};

export default function MainAdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [clinics, setClinics] = useState<ClinicSummary[]>([]);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      setIsLoading(true);
      setStatsError(null);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Missing authentication token.");
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

        const fetchJson = async <T,>(path: string): Promise<T> => {
          const response = await fetch(`${baseUrl}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.message ?? `Failed to load ${path}`);
          }
          return data as T;
        };

        const [statsData, usersData, clinicsData, ticketsData] =
          await Promise.all([
            fetchJson<PlatformStats>("/admin/stats"),
            fetchJson<unknown>("/users?limit=1000&page=1"),
            fetchJson<unknown>("/clinics/admin/all"),
            fetchJson<unknown>("/support-tickets"),
          ]);

        const normalizeArray = <T,>(value: unknown): T[] => {
          if (Array.isArray(value)) return value;
          if (Array.isArray((value as { data?: T[] })?.data)) {
            return (value as { data?: T[] }).data ?? [];
          }
          return [];
        };

        if (isMounted) {
          setStats(statsData);
          setUsers(normalizeArray<UserSummary>(usersData));
          setClinics(normalizeArray<ClinicSummary>(clinicsData));
          setTickets(normalizeArray<TicketSummary>(ticketsData));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load stats.";
        if (isMounted) {
          setStatsError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const overview = stats ?? {
    totalUsers: 0,
    totalActiveClients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalRegisteredPets: 0,
    totalOpenTickets: 0,
    pendingInvoices: 0,
    pendingVets: 0,
    appointmentsByStatus: {
      COMPLETED: 0,
      PENDING: 0,
      CONFIRMED: 0,
    },
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const usersByRole = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      const role = user.role?.toUpperCase() ?? "UNKNOWN";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [users]);

  const usersByActivity = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const inactive = Math.max(users.length - active, 0);
    return [
      { name: "Active", value: active },
      { name: "Inactive", value: inactive },
    ];
  }, [users]);

  const clinicsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    clinics.forEach((clinic) => {
      const status = clinic.status?.toUpperCase() ?? "UNKNOWN";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [clinics]);

  const ticketsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    tickets.forEach((ticket) => {
      const status = ticket.status?.toUpperCase() ?? "UNKNOWN";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [tickets]);

  const appointmentsByStatus = useMemo(
    () =>
      Object.entries(overview.appointmentsByStatus ?? {}).map(
        ([name, value]) => ({
          name,
          value: Number(value ?? 0),
        }),
      ),
    [overview.appointmentsByStatus],
  );

  const activeUsers =
    usersByActivity.find((entry) => entry.name === "Active")?.value ?? 0;
  const inactiveUsers =
    usersByActivity.find((entry) => entry.name === "Inactive")?.value ?? 0;
  const approvedClinics =
    clinicsByStatus.find((entry) => entry.name === "APPROVED")?.value ?? 0;
  const pendingClinics =
    clinicsByStatus.find((entry) => entry.name === "PENDING")?.value ?? 0;

  const chartColors = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#0ea5e9",
  ];

  return (
    <ProtectedRoute allowedRoles={["main_admin"]}>
      <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              System Control (Main Admin)
            </h1>
            <p className="text-muted-foreground">
              Tech support, branch monitoring, and Git-style daily deploy
              authorizations.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Platform Overview</h2>
              <p className="text-sm text-muted-foreground">
                Live system stats across users, clinics, and operations.
              </p>
            </div>
            {isLoading ? (
              <Badge variant="secondary">Loading stats...</Badge>
            ) : statsError ? (
              <Badge variant="destructive">Stats unavailable</Badge>
            ) : (
              <Badge variant="secondary">Live stats</Badge>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Clients
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.totalActiveClients}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clients with active services
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Registered Pets
                </CardTitle>
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.totalRegisteredPets}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total pets in system
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading
                    ? "—"
                    : currencyFormatter.format(overview.totalRevenue)}
                </div>
                <p className="text-xs text-primary-foreground/80 mt-1">
                  Gross platform revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total scheduled visits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Tickets
                </CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.totalOpenTickets}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Support issues awaiting response
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Invoices
                </CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.pendingInvoices}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Invoices awaiting payment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Vets
                </CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : overview.pendingVets}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vet approvals in queue
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments by Status
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confirmed</span>
                  <Badge variant="secondary">
                    {isLoading ? "—" : overview.appointmentsByStatus.CONFIRMED}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <Badge variant="outline">
                    {isLoading ? "—" : overview.appointmentsByStatus.PENDING}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <Badge variant="default">
                    {isLoading ? "—" : overview.appointmentsByStatus.COMPLETED}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Operational Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              Live counts derived from core data sources.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : activeUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inactive Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : inactiveUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users currently inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved Clinics
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : approvedClinics}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clinics approved to operate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Clinics
                </CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "—" : pendingClinics}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Visual summaries of platform activity.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Status</CardTitle>
                <CardDescription>
                  Distribution of current appointment states.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading chart...
                  </p>
                ) : statsError ? (
                  <p className="text-sm text-muted-foreground">
                    Chart unavailable.
                  </p>
                ) : appointmentsByStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>
                  Role distribution across all registered users.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading chart...
                  </p>
                ) : statsError ? (
                  <p className="text-sm text-muted-foreground">
                    Chart unavailable.
                  </p>
                ) : usersByRole.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersByRole}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#16a34a"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinics by Status</CardTitle>
                <CardDescription>
                  Approval pipeline for registered clinics.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading chart...
                  </p>
                ) : statsError ? (
                  <p className="text-sm text-muted-foreground">
                    Chart unavailable.
                  </p>
                ) : clinicsByStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clinicsByStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {clinicsByStatus.map((entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Status</CardTitle>
                <CardDescription>
                  Current workload across support tickets.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading chart...
                  </p>
                ) : statsError ? (
                  <p className="text-sm text-muted-foreground">
                    Chart unavailable.
                  </p>
                ) : ticketsByStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
