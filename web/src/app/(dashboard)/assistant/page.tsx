"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ui/protected-route";
import {
  Users,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
} from "lucide-react";
import type { AppointmentStatus, InvoiceStatus } from "@/lib/types";
import {
  appointmentService,
  type Appointment,
} from "@/app/services/appointment.service";
import { invoiceService, type Invoice } from "@/app/services/invoice.service";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AssistantPage() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [arrivedAppointments, setArrivedAppointments] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const profile = await appointmentService.getMyProfile();
        if (profile.clinicId) {
          const [allAppointments, allInvoices] = await Promise.all([
            appointmentService.getClinicAppointments(profile.clinicId),
            invoiceService.getClinicInvoices(profile.clinicId),
          ]);

          setQueue(
            allAppointments.filter(
              (a) => a.status === "CONFIRMED" || a.status === "PENDING",
            ),
          );
          setInvoices(allInvoices);
        }
      } catch (error) {
        console.error("Failed to load front desk data", error);
        toast.error("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredQueue = useMemo(() => {
    if (!searchTerm) return queue;
    return queue.filter(
      (q) =>
        q.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.owner?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.owner?.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [queue, searchTerm]);

  const waitingCount = queue.filter((q) => q.status === "PENDING").length;
  const inConsultCount = queue.filter((q) => q.status === "CONFIRMED").length;

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentService.updateAppointmentStatus(id, "CONFIRMED");
      setQueue((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, status: "CONFIRMED" as AppointmentStatus } : q,
        ),
      );
      toast.success("Patient checked in successfully.");
    } catch (error) {
      toast.error("Failed to check in patient.");
    }
  };

  const handleArrived = (id: string) => {
    setArrivedAppointments((prev) => new Set(prev).add(id));
  };

  const handleNoShow = async (id: string) => {
    try {
      await appointmentService.updateAppointmentStatus(id, "NO_SHOW");
      setQueue((prev) => prev.filter((q) => q.id !== id));
      toast.success("Appointment marked as No Show.");
    } catch (error) {
      toast.error("Failed to mark as No Show.");
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await invoiceService.payInvoice(id);
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "PAID" as InvoiceStatus,
                paidAt: new Date().toISOString(),
              }
            : i,
        ),
      );
      toast.success("Payment processed successfully.");
    } catch (error) {
      toast.error("Failed to process payment.");
    }
  };

  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch) return pendingInvoices;
    return pendingInvoices.filter(
      (i: any) =>
        i.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.owner?.firstName
          ?.toLowerCase()
          .includes(invoiceSearch.toLowerCase()) ||
        i.owner?.lastName?.toLowerCase().includes(invoiceSearch.toLowerCase()),
    );
  }, [pendingInvoices, invoiceSearch]);

  return (
    <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Front Desk</h1>
            <p className="text-muted-foreground mt-1">
              Manage check-ins, queue, and process billing.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Waiting Room
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {waitingCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Patients currently waiting
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Consultation
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {inConsultCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently with a vet
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Receipt className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pendingInvoices.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Rs.{" "}
                {pendingInvoices
                  .reduce((s, i) => s + i.amount, 0)
                  .toLocaleString()}{" "}
                outstanding
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Queue Management */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
              <CardDescription>
                Live view of the clinic waiting room.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient or owner..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.filter((q) => q.status !== "COMPLETED")
                    .length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No patients in queue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueue
                      .filter((q) => q.status !== "COMPLETED")
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.pet?.name}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.pet?.species})
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.owner?.firstName} {item.owner?.lastName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(item.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            {arrivedAppointments.has(item.id) ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Arrived
                              </Badge>
                            ) : (
                              <Badge
                                variant={
                                  item.status === "CONFIRMED"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  item.status === "CONFIRMED"
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-amber-100 text-amber-800"
                                }
                              >
                                {item.status === "CONFIRMED"
                                  ? "In Consult"
                                  : "Waiting"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.status === "PENDING" ? (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(item.id)}
                              >
                                Check In
                              </Button>
                            ) : item.status === "CONFIRMED" ? (
                              arrivedAppointments.has(item.id) ? (
                                <span className="text-sm text-muted-foreground">
                                  Arrived
                                </span>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleArrived(item.id)}
                                  >
                                    Arrived
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleNoShow(item.id)}
                                  >
                                    Not Show
                                  </Button>
                                </div>
                              )
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Bill */}
          <div className="space-y-4">
            <Card className="bg-zinc-900 text-zinc-50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-50 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Quick Bill
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Process pending payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search invoice..."
                    className="bg-zinc-800 border-zinc-700 text-zinc-50 pl-9"
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredInvoices.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">
                      No pending invoices.
                    </p>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 border border-zinc-700"
                      >
                        <div>
                          <p className="font-mono text-xs text-zinc-400">
                            {inv.id.toUpperCase()}
                          </p>
                          <p className="text-sm font-medium">
                            {(inv as any).owner?.firstName}{" "}
                            {(inv as any).owner?.lastName}
                          </p>
                          <p className="text-lg font-bold text-amber-400">
                            Rs. {inv.amount.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkPaid(inv.id)}
                        >
                          Pay
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
