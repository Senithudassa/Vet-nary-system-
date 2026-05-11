"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { toast } from "sonner";
import {
  appointmentService,
  Appointment,
} from "@/app/services/appointment.service";
import { vetbookService } from "@/app/services/vetbook.service";
import { invoiceService } from "@/app/services/invoice.service";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Syringe,
  CheckCircle,
  Activity,
  Clock,
} from "lucide-react";

const SAMPLE_VACCINES = [
  "Rabies",
  "DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)",
  "Bordetella",
  "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
  "FeLV (Feline Leukemia Virus)",
];

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [clinicId, setClinicId] = useState<string>("");
  const [timeline, setTimeline] = useState<any[]>([]);

  // Medical Record Form
  const [medicalForm, setMedicalForm] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
  });
  const [medicalLoading, setMedicalLoading] = useState(false);

  // Vaccination Form
  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: "",
    batchNumber: "",
    nextDueDate: "",
  });
  const [vaccineLoading, setVaccineLoading] = useState(false);

  // Prescription Form
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Complete Appointment & Invoice Form
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    amount: "",
  });
  const [completeLoading, setCompleteLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const profile = await appointmentService.getMyProfile();
      if (profile.role !== "VET" && profile.role !== "vet") {
        toast.error("Unauthorized");
        router.push("/appointments");
        return;
      }

      const cId = profile.clinicId;
      if (!cId) throw new Error("No clinic associated");
      setClinicId(cId);

      const apts = await appointmentService.getClinicAppointments(cId);
      const apt = apts.find((a) => a.id === id);
      if (!apt) {
        toast.error("Appointment not found");
        router.push("/appointments");
        return;
      }
      setAppointment(apt);

      // Fetch timeline
      if (apt.petId) {
        const history = await vetbookService.getPetTimeline(apt.petId);
        setTimeline(history);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load appointment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, router]);

  const handleAddMedicalRecord = async () => {
    if (!appointment?.petId || !clinicId) return;
    if (!medicalForm.diagnosis) {
      toast.error("Diagnosis is required");
      return;
    }
    setMedicalLoading(true);
    try {
      await vetbookService.addMedicalRecord(appointment.petId, {
        clinicId,
        ...medicalForm,
      });
      toast.success("Medical record added successfully");
      setMedicalForm({
        diagnosis: "",
        treatment: "",
        notes: "",
      });
      fetchDetails(); // refresh timeline
    } catch (err: any) {
      toast.error(err.message || "Failed to add medical record");
    } finally {
      setMedicalLoading(false);
    }
  };

  const handleAddVaccination = async () => {
    if (!appointment?.petId || !clinicId) return;
    if (!vaccineForm.vaccineName || !vaccineForm.batchNumber) {
      toast.error("Vaccine name and batch number are required");
      return;
    }
    setVaccineLoading(true);
    try {
      await vetbookService.addVaccination(appointment.petId, {
        clinicId,
        vaccineName: vaccineForm.vaccineName,
        batchNumber: vaccineForm.batchNumber,
        nextDueDate: vaccineForm.nextDueDate
          ? new Date(vaccineForm.nextDueDate).toISOString()
          : undefined,
      });
      toast.success("Vaccination added successfully");
      setVaccineForm({ vaccineName: "", batchNumber: "", nextDueDate: "" });
      fetchDetails(); // refresh timeline
    } catch (err: any) {
      toast.error(err.message || "Failed to add vaccination");
    } finally {
      setVaccineLoading(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!appointment?.petId || !clinicId) return;
    if (!prescriptionForm.medicineName) {
      toast.error("Medicine name is required");
      return;
    }
    setPrescriptionLoading(true);
    try {
      await vetbookService.addPrescription(appointment.petId, {
        clinicId,
        appointmentId: appointment.id,

        medicineName: prescriptionForm.medicineName,
        dosage: prescriptionForm.dosage || undefined,
        frequency: prescriptionForm.frequency || undefined,
        duration: prescriptionForm.duration || undefined,
        notes: prescriptionForm.notes || undefined,
      });
      toast.success("Prescription added successfully");
      setPrescriptionForm({
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      });
      fetchDetails(); // refresh timeline
    } catch (err: any) {
      toast.error(err.message || "Failed to add prescription");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleCompleteAndInvoice = async () => {
    if (!appointment?.ownerId || !clinicId) return;
    if (!invoiceForm.amount || isNaN(Number(invoiceForm.amount))) {
      toast.error("Valid amount is required");
      return;
    }
    setCompleteLoading(true);
    try {
      // 1. Create Invoice
      await invoiceService.createInvoice({
        clinicId,
        ownerId: appointment.ownerId,
        appointmentId: appointment.id,
        amount: Number(invoiceForm.amount),
      });

      // 2. Update Status to COMPLETED
      await appointmentService.updateAppointmentStatus(
        appointment.id,
        "COMPLETED",
      );

      toast.success("Invoice created and appointment completed");
      setAppointment({ ...appointment, status: "COMPLETED" });
      setIsCompleteDialogOpen(false);
      setInvoiceForm({ amount: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to complete appointment");
    } finally {
      setCompleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!appointment) return null;

  const isEditable =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <ProtectedRoute allowedRoles={["vet"]}>
      <div className="space-y-6 p-4 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage medical records, vaccinations, and billing for this visit.
            </p>
          </div>
          <div className="flex gap-2">
            {appointment.status === "COMPLETED" ? (
              <Button variant="secondary" disabled>
                <CheckCircle className="mr-2 h-4 w-4" /> Completed
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setIsCompleteDialogOpen(true)}
                disabled={!isEditable}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Complete Appointment
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Pet Name:</span>{" "}
                {appointment.pet?.name || "Unknown"}
              </div>
              <div>
                <span className="font-semibold">Species:</span>{" "}
                {appointment.pet?.species || "Unknown"}
              </div>
              <div>
                <span className="font-semibold">Owner:</span>{" "}
                {appointment.owner?.firstName} {appointment.owner?.lastName}
              </div>
              <div>
                <span className="font-semibold">Date & Time:</span>{" "}
                {new Date(appointment.date).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Reason:</span>{" "}
                {appointment.reason || "None provided"}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                {appointment.status}
              </div>
            </CardContent>
          </Card>

          {/* Past History Timeline */}
          <Card className="md:row-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pet History
              </CardTitle>
              <CardDescription>
                Past medical, vaccination, and prescription records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No past history found.
                </p>
              ) : (
                <div className="space-y-6">
                  {timeline.map((item) => (
                    <div
                      key={item.id}
                      className="relative pl-6 border-l-2 border-muted pb-4 last:pb-0"
                    >
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {item.type === "MEDICAL"
                            ? "Medical Record"
                            : item.type === "VACCINE"
                              ? "Vaccination"
                              : "Prescription"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.recordDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.type === "MEDICAL" ? (
                          <>
                            <p>
                              <span className="font-medium text-foreground">
                                Diagnosis:
                              </span>{" "}
                              {item.diagnosis}
                            </p>
                            {item.treatment && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Treatment:
                                </span>{" "}
                                {item.treatment}
                              </p>
                            )}
                            {item.prescription && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Prescription:
                                </span>{" "}
                                {item.prescription}
                              </p>
                            )}
                          </>
                        ) : item.type === "VACCINE" ? (
                          <>
                            <p>
                              <span className="font-medium text-foreground">
                                Vaccine:
                              </span>{" "}
                              {item.vaccineName}
                            </p>
                            <p>
                              <span className="font-medium text-foreground">
                                Batch:
                              </span>{" "}
                              {item.batchNumber}
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              <span className="font-medium text-foreground">
                                Medicine:
                              </span>{" "}
                              {item.medicineName}
                            </p>
                            {item.dosage && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Dosage:
                                </span>{" "}
                                {item.dosage}
                              </p>
                            )}
                            {item.frequency && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Frequency:
                                </span>{" "}
                                {item.frequency}
                              </p>
                            )}
                            {item.duration && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Duration:
                                </span>{" "}
                                {item.duration}
                              </p>
                            )}
                            {item.notes && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Notes:
                                </span>{" "}
                                {item.notes}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Medical Record */}
          {isEditable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Add Medical Record
                </CardTitle>
                <CardDescription>
                  Record the diagnosis and treatment plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Input
                    value={medicalForm.diagnosis}
                    onChange={(e) =>
                      setMedicalForm({
                        ...medicalForm,
                        diagnosis: e.target.value,
                      })
                    }
                    placeholder="e.g. Gastroenteritis"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Treatment</Label>
                  <Textarea
                    value={medicalForm.treatment}
                    onChange={(e) =>
                      setMedicalForm({
                        ...medicalForm,
                        treatment: e.target.value,
                      })
                    }
                    placeholder="e.g. Dietary restriction"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={medicalForm.notes}
                    onChange={(e) =>
                      setMedicalForm({ ...medicalForm, notes: e.target.value })
                    }
                    placeholder="Any additional observations"
                  />
                </div>
                <Button
                  onClick={handleAddMedicalRecord}
                  disabled={medicalLoading}
                  className="w-full"
                >
                  {medicalLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Medical Record
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Prescription */}
          {isEditable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Add Prescription
                </CardTitle>
                <CardDescription>
                  Issue medication instructions for this visit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicine Name *</Label>
                  <Input
                    value={prescriptionForm.medicineName}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicineName: e.target.value,
                      })
                    }
                    placeholder="e.g. Amoxicillin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    value={prescriptionForm.dosage}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        dosage: e.target.value,
                      })
                    }
                    placeholder="e.g. 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    value={prescriptionForm.frequency}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        frequency: e.target.value,
                      })
                    }
                    placeholder="e.g. Twice a day"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={prescriptionForm.duration}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        duration: e.target.value,
                      })
                    }
                    placeholder="e.g. 7 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={prescriptionForm.notes}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Additional instructions"
                  />
                </div>
                <Button
                  onClick={handleAddPrescription}
                  disabled={prescriptionLoading}
                  className="w-full"
                >
                  {prescriptionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Prescription
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Vaccination */}
          {isEditable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" /> Add Vaccination
                </CardTitle>
                <CardDescription>Record administered vaccines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vaccine Name *</Label>
                  <Select
                    value={vaccineForm.vaccineName}
                    onValueChange={(v) =>
                      setVaccineForm({ ...vaccineForm, vaccineName: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vaccine" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_VACCINES.map((vaccine) => (
                        <SelectItem key={vaccine} value={vaccine}>
                          {vaccine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Batch Number *</Label>
                  <Input
                    value={vaccineForm.batchNumber}
                    onChange={(e) =>
                      setVaccineForm({
                        ...vaccineForm,
                        batchNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. LOT-12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Due Date</Label>
                  <Input
                    type="date"
                    value={vaccineForm.nextDueDate}
                    onChange={(e) =>
                      setVaccineForm({
                        ...vaccineForm,
                        nextDueDate: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={handleAddVaccination}
                  disabled={vaccineLoading}
                  className="w-full"
                >
                  {vaccineLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Vaccination
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Complete & Invoice Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Appointment & Generate Invoice</DialogTitle>
            <DialogDescription>
              Provide the total billed amount for this visit before completing
              the appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Total Amount (USD) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={invoiceForm.amount}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                }
                placeholder="e.g. 75.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteAndInvoice}
              disabled={completeLoading}
            >
              {completeLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Complete & Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
