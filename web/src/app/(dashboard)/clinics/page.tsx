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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ui/protected-route";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clinicService } from "@/app/services/clinic.service";
import type {
  ClinicDetails,
  ClinicListItem,
  ClinicStatus,
} from "@/app/services/clinic.service";
import { toast } from "sonner";

const STATUS_BADGE: Record<
  ClinicStatus,
  { variant: "default" | "secondary" | "destructive"; className: string }
> = {
  APPROVED: {
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  PENDING: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
  REJECTED: { variant: "destructive", className: "" },
};

type PendingAction = {
  clinic: ClinicListItem;
  nextStatus: ClinicStatus;
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<ClinicListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicDetails | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  const pending = useMemo(
    () => clinics.filter((c) => c.status === "PENDING"),
    [clinics],
  );
  const approved = useMemo(
    () => clinics.filter((c) => c.status === "APPROVED"),
    [clinics],
  );
  const rejected = useMemo(
    () => clinics.filter((c) => c.status === "REJECTED"),
    [clinics],
  );

  useEffect(() => {
    const loadClinics = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await clinicService.getAllClinicsAdmin();
        setClinics(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load clinics.";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadClinics();
  }, []);

  useEffect(() => {
    if (!selectedClinicId) {
      setSelectedClinic(null);
      return;
    }

    setSelectedClinic(null);

    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        const details = await clinicService.getClinicDetails(selectedClinicId);
        setSelectedClinic(details);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load clinic details.";
        toast.error(message);
        setSelectedClinic(null);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadDetails();
  }, [selectedClinicId]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const updateClinicInList = (updated: ClinicListItem) => {
    setClinics((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  };

  const requestStatusChange = (
    clinic: ClinicListItem,
    nextStatus: ClinicStatus,
  ) => {
    setPendingAction({ clinic, nextStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const updated = await clinicService.updateClinicStatus(
        pendingAction.clinic.id,
        pendingAction.nextStatus,
      );
      updateClinicInList(updated);
      if (selectedClinic?.id === updated.id) {
        setSelectedClinic((prev) => (prev ? { ...prev, ...updated } : prev));
      }
      toast.success(
        `${pendingAction.clinic.name} has been ${pendingAction.nextStatus.toLowerCase()}.`,
      );
      setPendingAction(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const ClinicTable = ({
    items,
    showActions,
  }: {
    items: ClinicListItem[];
    showActions: boolean;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clinic Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={showActions ? 7 : 6}
              className="text-center py-8 text-muted-foreground"
            >
              No clinics in this category.
            </TableCell>
          </TableRow>
        ) : (
          items.map((clinic) => (
            <TableRow
              key={clinic.id}
              className="cursor-pointer"
              onClick={() => setSelectedClinicId(clinic.id)}
            >
              <TableCell className="font-medium">{clinic.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                <div className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {clinic.address}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {clinic.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {clinic.phone}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {clinic.operatingHours || "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_BADGE[clinic.status].variant}
                  className={STATUS_BADGE[clinic.status].className}
                >
                  {clinic.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(clinic.createdAt)}
              </TableCell>
              {showActions && (
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {clinic.status === "PENDING" && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        onClick={() => requestStatusChange(clinic, "APPROVED")}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => requestStatusChange(clinic, "REJECTED")}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {clinic.status === "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requestStatusChange(clinic, "APPROVED")}
                    >
                      Re-approve
                    </Button>
                  )}
                  {clinic.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => requestStatusChange(clinic, "REJECTED")}
                    >
                      Suspend
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <ProtectedRoute allowedRoles={["main_admin"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Clinic Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, and manage clinic registrations on the platform.
          </p>
          {loadError && (
            <p className="text-sm text-red-500 mt-2">{loadError}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clinics
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinics.length}</div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pending.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approved.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {rejected.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Queue - highlighted */}
        {pending.length > 0 && (
          <Card className="border-amber-500/30 shadow-sm">
            <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <Clock className="h-5 w-5" />
                Pending Approval Queue ({pending.length})
              </CardTitle>
              <CardDescription>
                These clinics are awaiting your review. Approved clinics will
                appear on the mobile app.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading clinics...
                </div>
              ) : (
                <ClinicTable items={pending} showActions={true} />
              )}
            </CardContent>
          </Card>
        )}

        {/* All Clinics Tabs */}
        <Tabs defaultValue="approved">
          <TabsList>
            <TabsTrigger value="approved">
              Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejected.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({clinics.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="approved">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading clinics...
                  </div>
                ) : (
                  <ClinicTable items={approved} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading clinics...
                  </div>
                ) : (
                  <ClinicTable items={rejected} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="all">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading clinics...
                  </div>
                ) : (
                  <ClinicTable items={clinics} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={selectedClinicId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedClinicId(null);
        }}
      >
        <DialogContent className="max-w-5xl w-full sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClinic?.name ?? "Clinic Details"}
            </DialogTitle>
            <DialogDescription>
              Full clinic profile including owner and staff details.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className="text-sm text-muted-foreground">
              Loading clinic details...
            </div>
          )}

          {!detailsLoading && selectedClinic && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">
                    Clinic Information
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedClinic.address}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Coordinates: {selectedClinic.latitude ?? "—"},{" "}
                      {selectedClinic.longitude ?? "—"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedClinic.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedClinic.operatingHours || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={STATUS_BADGE[selectedClinic.status].variant}
                        className={
                          STATUS_BADGE[selectedClinic.status].className
                        }
                      >
                        {selectedClinic.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Registered {formatDate(selectedClinic.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDate(selectedClinic.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">
                    Owner
                  </div>
                  {selectedClinic.owner ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedClinic.owner.firstName}{" "}
                          {selectedClinic.owner.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClinic.owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClinic.owner.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {selectedClinic.owner.role.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {selectedClinic.owner.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                      <div className="grid gap-2 text-xs text-muted-foreground">
                        <div>
                          Account No:{" "}
                          <span className="text-foreground">
                            {selectedClinic.owner.accountNumber || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No owner assigned.
                    </div>
                  )}
                </div>
              </div>

              {selectedClinic.owner?.licenseCertificateUrl && (
                <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">
                    Owner License Certificate
                  </div>
                  <div className="space-y-2">
                    <img
                      src={selectedClinic.owner.licenseCertificateUrl}
                      alt="License Certificate"
                      className="w-full max-h-100 object-contain rounded-md border bg-background"
                    />
                    <a
                      href={selectedClinic.owner.licenseCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Full Size
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="text-xs uppercase text-muted-foreground">
                  Staff
                </div>
                {selectedClinic.staff.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No staff members assigned.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                    {selectedClinic.staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </div>
                          <div className="text-muted-foreground">
                            {member.user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.user.phone || "—"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary">
                            {member.user.role.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {member.user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedClinic && (
              <>
                {selectedClinic.status === "PENDING" && (
                  <>
                    <Button
                      onClick={() =>
                        requestStatusChange(selectedClinic, "APPROVED")
                      }
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        requestStatusChange(selectedClinic, "REJECTED")
                      }
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {selectedClinic.status === "REJECTED" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      requestStatusChange(selectedClinic, "APPROVED")
                    }
                  >
                    Re-approve
                  </Button>
                )}
                {selectedClinic.status === "APPROVED" && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      requestStatusChange(selectedClinic, "REJECTED")
                    }
                  >
                    Suspend
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Update</DialogTitle>
            <DialogDescription>
              {pendingAction
                ? `Are you sure you want to mark ${pendingAction.clinic.name} as ${pendingAction.nextStatus.toLowerCase()}?`
                : "Confirm status update."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={actionLoading}>
              {actionLoading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
