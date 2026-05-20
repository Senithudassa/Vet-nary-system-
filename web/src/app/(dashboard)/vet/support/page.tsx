"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/ui/protected-route";
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpCircle,
} from "lucide-react";
import type { SupportTicket, TicketStatus, User } from "@/lib/types";
import { supportTicketsService } from "@/app/services/support-tickets.service";
import {
  clinicService,
  type ClinicDetails,
} from "@/app/services/clinic.service";
import { userService } from "@/app/services/user.service";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  TicketStatus,
  { color: string; icon: React.ReactNode }
> = {
  OPEN: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  IN_PROGRESS: {
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: <Clock className="h-3 w-3" />,
  },
  RESOLVED: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const formatName = (
  user?: { firstName?: string | null; lastName?: string | null },
  fallback = "Unknown",
) => {
  if (!user) return fallback;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VetSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [escalatingTicketId, setEscalatingTicketId] = useState<string | null>(
    null,
  );

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportTicketsService.listAssignedTickets();
      setTickets(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load tickets.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    }),
    [tickets],
  );

  const clinicDetails =
    (viewTicket?.targetClinic as ClinicDetails | undefined) ?? undefined;

  const updateStatus = async (id: string, newStatus: TicketStatus) => {
    setUpdatingTicketId(id);
    try {
      const updated = await supportTicketsService.updateTicket(id, {
        status: newStatus,
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (viewTicket?.id === id) setViewTicket(updated);
      toast.success(
        `Ticket status updated to ${newStatus.replace("_", " ").toLowerCase()}.`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update ticket.",
      );
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const escalateToAdmin = async (id: string) => {
    setEscalatingTicketId(id);
    try {
      const updated = await supportTicketsService.escalateTicket(id);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (viewTicket?.id === id) setViewTicket(updated);
      toast.success("Ticket escalated to admin successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to escalate ticket.",
      );
    } finally {
      setEscalatingTicketId(null);
    }
  };

  const enrichTicketDetails = async (ticket: SupportTicket) => {
    setDetailsLoading(true);
    try {
      const updates: Partial<SupportTicket> = {};
      const needsUserDetails = (user?: Partial<User>) =>
        !user || user.isActive === undefined || !user.email;

      if (ticket.ownerId && needsUserDetails(ticket.owner)) {
        updates.owner = await userService.getUserById(ticket.ownerId);
      }
      if (ticket.assignedVetId && needsUserDetails(ticket.assignedVet)) {
        updates.assignedVet = await userService.getUserById(
          ticket.assignedVetId,
        );
      }
      if (ticket.assignedAdminId && needsUserDetails(ticket.assignedAdmin)) {
        updates.assignedAdmin = await userService.getUserById(
          ticket.assignedAdminId,
        );
      }

      if (
        ticket.targetClinicId &&
        (!ticket.targetClinic ||
          !("address" in ticket.targetClinic) ||
          !("status" in ticket.targetClinic))
      ) {
        const clinic = await clinicService.getClinicDetails(
          ticket.targetClinicId,
        );
        updates.targetClinic =
          clinic as unknown as SupportTicket["targetClinic"];
      }

      if (Object.keys(updates).length > 0) {
        const merged: SupportTicket = { ...ticket, ...updates };
        setViewTicket(merged);
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? merged : t)),
        );
      }
    } catch {
      toast.error("Failed to load ticket details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["vet"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            View and manage support tickets assigned to you.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Open
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.open}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Assigned Tickets</CardTitle>
                <CardDescription>
                  Support tickets assigned to you from your clinic.
                </CardDescription>
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="space-y-3">
                        <div>{error}</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={loadTickets}
                        >
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {ticket.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatName(ticket.owner, "Unknown")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.targetClinic?.name || "General"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[ticket.status].color}`}
                        >
                          {STATUS_CONFIG[ticket.status].icon}
                          {ticket.status.replace("_", " ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewTicket(ticket);
                                  void enrichTicketDetails(ticket);
                                }}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{viewTicket?.subject}</DialogTitle>
                                <DialogDescription>
                                  Ticket {viewTicket?.id.toUpperCase()} ·{" "}
                                  {formatName(viewTicket?.owner)}
                                  {viewTicket?.targetClinic &&
                                    ` · ${viewTicket.targetClinic.name}`}
                                </DialogDescription>
                              </DialogHeader>
                              {viewTicket && (
                                <div className="space-y-4">
                                  <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                    {viewTicket.description}
                                  </div>
                                  <div className="grid gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        Current Status:
                                      </span>
                                      <div
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[viewTicket.status].color}`}
                                      >
                                        {STATUS_CONFIG[viewTicket.status].icon}
                                        {viewTicket.status.replace("_", " ")}
                                      </div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="rounded-md border p-3">
                                        <div className="text-xs uppercase text-muted-foreground mb-1">
                                          Creator
                                        </div>
                                        <div className="font-medium">
                                          {formatName(viewTicket.owner)}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.owner?.email ??
                                            "No email on file"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.owner?.phone ??
                                            "No phone number added."}
                                        </div>
                                        {viewTicket.owner?.role && (
                                          <div className="text-xs uppercase text-muted-foreground mt-1">
                                            {viewTicket.owner.role}
                                          </div>
                                        )}
                                      </div>
                                      <div className="rounded-md border p-3">
                                        <div className="text-xs uppercase text-muted-foreground mb-1">
                                          Assigned Vet
                                        </div>
                                        <div className="font-medium">
                                          {viewTicket.assignedVet
                                            ? formatName(viewTicket.assignedVet)
                                            : "Unassigned"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.assignedVet?.email ?? "—"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.assignedVet?.phone ??
                                            "No phone number added"}
                                        </div>
                                        {viewTicket.assignedVet?.role && (
                                          <div className="text-muted-foreground">
                                            Role: {viewTicket.assignedVet.role}
                                          </div>
                                        )}
                                      </div>
                                      <div className="rounded-md border p-3">
                                        <div className="text-xs uppercase text-muted-foreground mb-1">
                                          Assigned Admin
                                        </div>
                                        <div className="font-medium">
                                          {viewTicket.assignedAdmin
                                            ? formatName(
                                                viewTicket.assignedAdmin,
                                              )
                                            : "Unassigned"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.assignedAdmin?.email ??
                                            "—"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {viewTicket.assignedAdmin?.phone ??
                                            "No phone number added."}
                                        </div>
                                        {viewTicket.assignedAdmin?.role && (
                                          <div className="text-xs uppercase text-muted-foreground mt-1">
                                            {viewTicket.assignedAdmin.role}
                                          </div>
                                        )}
                                      </div>
                                      <div className="rounded-md border p-3">
                                        <div className="text-xs uppercase text-muted-foreground mb-1">
                                          Clinic
                                        </div>
                                        <div className="font-medium">
                                          {clinicDetails?.name ??
                                            viewTicket.targetClinic?.name ??
                                            "General"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {clinicDetails?.address ??
                                            "No address on file"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {clinicDetails?.phone ??
                                            "No phone number added"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {clinicDetails?.operatingHours ??
                                            "No operating hours provided"}
                                        </div>
                                        <div className="text-muted-foreground">
                                          Status:{" "}
                                          {clinicDetails?.status ?? "—"}
                                        </div>
                                        {clinicDetails?.owner && (
                                          <div className="text-muted-foreground">
                                            Owner:{" "}
                                            {formatName(clinicDetails.owner)} ·{" "}
                                            {clinicDetails.owner.isActive
                                              ? "Active"
                                              : "Inactive"}
                                          </div>
                                        )}
                                        {clinicDetails?.staff && (
                                          <div className="text-muted-foreground">
                                            Staff: {clinicDetails.staff.length}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Created{" "}
                                      {formatDateTime(viewTicket.createdAt)} ·
                                      Updated{" "}
                                      {formatDateTime(viewTicket.updatedAt)}
                                    </div>
                                    {detailsLoading && (
                                      <div className="text-xs text-muted-foreground">
                                        Loading additional details...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <DialogFooter className="gap-2 flex-wrap">
                                {viewTicket?.status === "OPEN" && (
                                  <Button
                                    disabled={
                                      updatingTicketId === viewTicket.id
                                    }
                                    onClick={() =>
                                      updateStatus(viewTicket.id, "IN_PROGRESS")
                                    }
                                  >
                                    Start Working
                                  </Button>
                                )}
                                {viewTicket?.status === "IN_PROGRESS" && (
                                  <Button
                                    disabled={
                                      updatingTicketId === viewTicket.id
                                    }
                                    onClick={() =>
                                      updateStatus(viewTicket.id, "RESOLVED")
                                    }
                                  >
                                    Mark Resolved
                                  </Button>
                                )}
                                {viewTicket?.status === "RESOLVED" && (
                                  <Button
                                    variant="outline"
                                    disabled={
                                      updatingTicketId === viewTicket.id
                                    }
                                    onClick={() =>
                                      updateStatus(viewTicket.id, "OPEN")
                                    }
                                  >
                                    Reopen
                                  </Button>
                                )}
                                {viewTicket && !viewTicket.assignedAdminId && (
                                  <Button
                                    variant="secondary"
                                    disabled={
                                      escalatingTicketId === viewTicket.id
                                    }
                                    onClick={() =>
                                      escalateToAdmin(viewTicket.id)
                                    }
                                  >
                                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                                    {escalatingTicketId === viewTicket.id
                                      ? "Escalating..."
                                      : "Escalate to Admin"}
                                  </Button>
                                )}
                                {viewTicket?.assignedAdminId && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Escalated to admin
                                  </div>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {ticket.status === "OPEN" && (
                            <Button
                              size="sm"
                              disabled={updatingTicketId === ticket.id}
                              onClick={() =>
                                updateStatus(ticket.id, "IN_PROGRESS")
                              }
                            >
                              Start
                            </Button>
                          )}
                          {ticket.status === "IN_PROGRESS" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={updatingTicketId === ticket.id}
                              onClick={() =>
                                updateStatus(ticket.id, "RESOLVED")
                              }
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
