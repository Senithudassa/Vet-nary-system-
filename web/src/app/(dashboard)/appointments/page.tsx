"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ui/protected-route";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  ListOrdered,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  appointmentService,
  Appointment,
  AppointmentStatus,
  QueueEntry,
  Clinic,
  Pet,
} from "@/app/services/appointment.service";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { color: string; icon: React.ReactNode }
> = {
  PENDING: {
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: <Clock className="h-3 w-3" />,
  },
  CONFIRMED: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  COMPLETED: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: <XCircle className="h-3 w-3" />,
  },
  NO_SHOW: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

export default function AppointmentsPage() {
  const [userRole, setUserRole] = useState<string>("");
  const [clinicId, setClinicId] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"appointments" | "queue">(
    "appointments",
  );
  const router = useRouter();

  // Book dialog
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [form, setForm] = useState({
    clinicId: "",
    petId: "",
    date: "",
    reason: "",
  });

  // Add to Queue dialog
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueForm, setQueueForm] = useState({ petId: "", appointmentId: "" });
  const [queueAddLoading, setQueueAddLoading] = useState(false);

  // Status update loading
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pet verification dialog (Vet)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyingPetId, setVerifyingPetId] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDetailsLoading, setVerifyDetailsLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const isVet = userRole === "VET" || userRole === "vet";
  const isCustomer = userRole === "CUSTOMER" || userRole === "customer";

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const profile = await appointmentService.getMyProfile();
        setUserRole(profile.role);

        if (profile.role === "VET" || profile.role === "vet") {
          const cId = profile.clinicId ?? "";
          setClinicId(cId);
          const [apts, q, vetPets] = await Promise.all([
            cId
              ? appointmentService.getClinicAppointments(cId)
              : Promise.resolve([]),
            cId ? appointmentService.getQueue(cId) : Promise.resolve([]),
            appointmentService.getPetsForVet(),
          ]);
          setAppointments(Array.isArray(apts) ? apts : []);
          setQueue(Array.isArray(q) ? q : []);
          setPets(
            Array.isArray(vetPets) ? vetPets.filter((p) => p.isActive) : [],
          );
        } else {
          const [apts, cls, myPets] = await Promise.all([
            appointmentService.getMyAppointments(),
            appointmentService.getClinics(),
            appointmentService.getMyPets(),
          ]);
          setAppointments(Array.isArray(apts) ? apts : []);
          setClinics(
            Array.isArray(cls)
              ? cls.filter((c) => c.status === "APPROVED")
              : [],
          );
          setPets(
            Array.isArray(myPets) ? myPets.filter((p) => p.isActive) : [],
          );
        }
      } catch (err: unknown) {
        toast.error((err as Error).message ?? "Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const refreshAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (isVet && clinicId) {
        const apts = await appointmentService.getClinicAppointments(clinicId);
        setAppointments(Array.isArray(apts) ? apts : []);
      } else {
        const apts = await appointmentService.getMyAppointments();
        setAppointments(Array.isArray(apts) ? apts : []);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to refresh.");
    } finally {
      setLoading(false);
    }
  }, [isVet, clinicId]);

  const refreshQueue = useCallback(async () => {
    if (!clinicId) return;
    setQueueLoading(true);
    try {
      const q = await appointmentService.getQueue(clinicId);
      setQueue(Array.isArray(q) ? q : []);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to refresh queue.");
    } finally {
      setQueueLoading(false);
    }
  }, [clinicId]);

  // ── Book Appointment ─────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!form.clinicId || !form.petId || !form.date) {
      toast.error("Clinic, pet, and date are required.");
      return;
    }
    setBookLoading(true);
    try {
      const apt = await appointmentService.bookAppointment({
        clinicId: form.clinicId,
        petId: form.petId,
        date: new Date(form.date).toISOString(),
        reason: form.reason || undefined,
      });
      setAppointments((prev) => [apt, ...prev]);
      toast.success("Appointment booked successfully!");
      setForm({ clinicId: "", petId: "", date: "", reason: "" });
      setIsBookOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to book appointment.");
    } finally {
      setBookLoading(false);
    }
  };

  // ── Update Status ────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentService.updateAppointmentStatus(
        id,
        newStatus,
      );
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...updated, status: newStatus } : a,
        ),
      );
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Add to Queue ─────────────────────────────────────────────────────────────
  const handleAddToQueue = async () => {
    if (!queueForm.petId) {
      toast.error("Pet is required.");
      return;
    }
    if (!clinicId) {
      toast.error("No clinic associated with your account.");
      return;
    }
    setQueueAddLoading(true);
    try {
      const entry = await appointmentService.addToQueue(
        clinicId,
        queueForm.petId,
        queueForm.appointmentId || undefined,
      );
      setQueue((prev) => [...prev, entry]);
      toast.success("Added to queue successfully!");
      setQueueForm({ petId: "", appointmentId: "" });
      setIsQueueOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to add to queue.");
    } finally {
      setQueueAddLoading(false);
    }
  };

  // ── Pet Verification ─────────────────────────────────────────────────────────
  const handleOpenVerification = async (petId?: string) => {
    if (!petId) {
      toast.error("Pet information is unavailable.");
      return;
    }
    setIsVerifyOpen(true);
    setVerifyingPetId(petId);
    setSelectedPet(null);
    setVerifyDetailsLoading(true);
    try {
      const data = await appointmentService.getPetDetails(petId);
      setSelectedPet(data);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to load pet details.");
    } finally {
      setVerifyDetailsLoading(false);
    }
  };

  const handleVerifyPet = async () => {
    if (!verifyingPetId) {
      toast.error("Pet information is unavailable.");
      return;
    }
    setVerifyLoading(true);
    try {
      const updated = await appointmentService.verifyPet(verifyingPetId);
      setSelectedPet(updated);
      setPets((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
      );
      toast.success("Pet verified successfully!");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to verify pet.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const getPetById = useCallback(
    (petId?: string) => {
      if (!petId) return null;
      return pets.find((p) => p.id === petId) ?? null;
    },
    [pets],
  );

  const formatDateTime = useCallback((value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
    }),
    [appointments],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute allowedRoles={["main_admin", "vet", "customer"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground mt-1">
              {isVet
                ? "Manage clinic appointments and patient queue."
                : "Your scheduled vet appointments."}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAppointments}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {/* Book — Customer only */}
            {isCustomer && (
              <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule an appointment for your pet at a clinic.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Clinic *</Label>
                      <Select
                        value={form.clinicId}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, clinicId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pet *</Label>
                      <Select
                        value={form.petId}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, petId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pet" />
                        </SelectTrigger>
                        <SelectContent>
                          {pets.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.species})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea
                        placeholder="Reason for visit..."
                        value={form.reason}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, reason: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsBookOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleBook} disabled={bookLoading}>
                      {bookLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Book Appointment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Add to Queue — Vet only */}
            {isVet && (
              <Dialog open={isQueueOpen} onOpenChange={setIsQueueOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ListOrdered className="h-4 w-4 mr-2" />
                    Add to Queue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Queue</DialogTitle>
                    <DialogDescription>
                      Add a patient to the clinic queue. Optionally link an
                      appointment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Pet ID *</Label>
                      <Input
                        placeholder="Enter pet UUID"
                        value={queueForm.petId}
                        onChange={(e) =>
                          setQueueForm((f) => ({ ...f, petId: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Appointment (optional)</Label>
                      <Select
                        value={queueForm.appointmentId}
                        onValueChange={(v) =>
                          setQueueForm((f) => ({ ...f, appointmentId: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link an appointment" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointments
                            .filter(
                              (a) =>
                                a.status === "CONFIRMED" ||
                                a.status === "PENDING",
                            )
                            .map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.pet?.name ?? "Pet"} —{" "}
                                {new Date(a.date).toLocaleString()}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsQueueOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddToQueue}
                      disabled={queueAddLoading}
                    >
                      {queueAddLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Add to Queue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
              color: "",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock className="h-4 w-4 text-amber-500" />,
              color: "text-amber-600",
            },
            {
              label: "Confirmed",
              value: stats.confirmed,
              icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
              color: "text-blue-600",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
              color: "text-green-600",
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs — Vet sees both, Customer sees only appointments */}
        {isVet && (
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "appointments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Appointments
            </button>
            <button
              onClick={() => {
                setActiveTab("queue");
                refreshQueue();
              }}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "queue" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Queue{" "}
                {queue.length > 0 && (
                  <Badge className="ml-1 h-4 px-1 text-[10px]">
                    {queue.length}
                  </Badge>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Appointments Table */}
        {activeTab === "appointments" && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>
                    View and manage scheduled visits.
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No appointments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((apt) => (
                        <TableRow
                          key={apt.id}
                          className={
                            isVet ? "cursor-pointer hover:bg-muted/50" : ""
                          }
                          onClick={() => {
                            if (isVet) router.push(`/appointments/${apt.id}`);
                          }}
                        >
                          <TableCell className="text-sm font-medium">
                            {new Date(apt.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {new Date(apt.date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {apt.pet?.name ?? "—"}
                            <span className="text-muted-foreground text-xs">
                              {" "}
                              ({apt.pet?.species ?? "?"})
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {apt.owner?.firstName} {apt.owner?.lastName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {apt.clinic?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {apt.reason ?? "—"}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const petRecord = getPetById(apt.petId);
                              const verificationLabel = petRecord
                                ? petRecord.isVerified
                                  ? "Verified"
                                  : "Unverified"
                                : "Unknown";
                              const isVerified = petRecord?.isVerified ?? false;

                              return (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      verificationLabel === "Verified"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      verificationLabel === "Verified"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : ""
                                    }
                                  >
                                    {verificationLabel}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleOpenVerification(apt.petId);
                                    }}
                                  >
                                    {isVet && !isVerified ? "Verify" : "View"}
                                  </Button>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[apt.status].color}`}
                            >
                              {STATUS_CONFIG[apt.status].icon}
                              {apt.status.replace("_", " ")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {updatingId === apt.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                            ) : (
                              <>
                                {apt.status === "PENDING" && (
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateStatus(apt.id, "CONFIRMED")
                                      }
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        updateStatus(apt.id, "CANCELLED")
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                                {apt.status === "CONFIRMED" && (
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateStatus(apt.id, "COMPLETED")
                                      }
                                    >
                                      Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() =>
                                        updateStatus(apt.id, "NO_SHOW")
                                      }
                                    >
                                      No Show
                                    </Button>
                                  </div>
                                )}
                                {(apt.status === "COMPLETED" ||
                                  apt.status === "CANCELLED" ||
                                  apt.status === "NO_SHOW") && (
                                  <span className="text-xs text-muted-foreground">
                                    Finalized
                                  </span>
                                )}
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Queue Table — Vet only */}
        {activeTab === "queue" && isVet && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Queue</CardTitle>
                  <CardDescription>
                    Current waiting list for the clinic.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshQueue}
                  disabled={queueLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${queueLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Linked Appointment</TableHead>
                      <TableHead>Appointment Status</TableHead>
                      <TableHead>Added At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Queue is empty.
                        </TableCell>
                      </TableRow>
                    ) : (
                      queue.map((entry, idx) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-bold text-muted-foreground">
                            {entry.position ?? idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.pet?.name ?? "—"}
                            <span className="text-muted-foreground text-xs">
                              {" "}
                              ({entry.pet?.species ?? "?"})
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.owner
                              ? `${entry.owner.firstName} ${entry.owner.lastName}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.appointment
                              ? new Date(entry.appointment.date).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "Walk-in"}
                          </TableCell>
                          <TableCell>
                            {entry.appointment ? (
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[entry.appointment.status].color}`}
                              >
                                {STATUS_CONFIG[entry.appointment.status].icon}
                                {entry.appointment.status.replace("_", " ")}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog
          open={isVerifyOpen}
          onOpenChange={(open) => {
            setIsVerifyOpen(open);
            if (!open) {
              setVerifyingPetId(null);
              setSelectedPet(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pet Verification</DialogTitle>
              <DialogDescription>
                Review pet details and verification status.
              </DialogDescription>
            </DialogHeader>
            {verifyDetailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : selectedPet ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedPet.isVerified ? "default" : "secondary"}
                    className={
                      selectedPet.isVerified
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {selectedPet.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                  {selectedPet.isVerified && (
                    <span className="text-xs text-muted-foreground">
                      Verified {formatDateTime(selectedPet.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium">Species:</span>{" "}
                    {selectedPet.species}
                  </div>
                  <div>
                    <span className="font-medium">Breed:</span>{" "}
                    {selectedPet.breed || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span>{" "}
                    {selectedPet.weight ? `${selectedPet.weight} kg` : "—"}
                  </div>
                  <div>
                    <span className="font-medium">Microchip:</span>{" "}
                    {selectedPet.microchip || "—"}
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Owner</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      {selectedPet.owner?.firstName}{" "}
                      {selectedPet.owner?.lastName}
                    </div>
                    <div>{selectedPet.owner?.phone || "—"}</div>
                    <div className="col-span-2">
                      {selectedPet.owner?.email || "—"}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3 text-xs text-muted-foreground">
                  Registered: {formatDateTime(selectedPet.createdAt)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No pet details available.
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>
                Close
              </Button>
              {isVet && selectedPet && !selectedPet.isVerified && (
                <Button onClick={handleVerifyPet} disabled={verifyLoading}>
                  {verifyLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Verify Pet
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
