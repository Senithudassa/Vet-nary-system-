"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Search, Stethoscope, FileText, Syringe, Activity } from "lucide-react";
import {
  appointmentService,
  apiFetch,
} from "@/app/services/appointment.service";
import { vetbookService } from "@/app/services/vetbook.service";
import type { Pet, Appointment } from "@/lib/types";

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  const [clinicId, setClinicId] = useState<string>("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [timeline, setTimeline] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isPetLoading, setIsPetLoading] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const profile = await appointmentService.getMyProfile();
        if (profile.clinicId) setClinicId(profile.clinicId);
        const vetPets = await apiFetch<Pet[]>("/pets/vet");
        setPets(vetPets);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!selectedPetId) return;
    async function loadPetData() {
      setIsPetLoading(true);
      try {
        const [petTimeline, allAppointments] = await Promise.all([
          vetbookService.getPetTimeline(selectedPetId),
          clinicId
            ? appointmentService.getClinicAppointments(clinicId)
            : Promise.resolve([]),
        ]);
        setTimeline(petTimeline);
        setAppointments(
          allAppointments.filter((a: any) => a.petId === selectedPetId),
        );
      } catch (error) {
        console.error("Failed to load pet data", error);
      } finally {
        setIsPetLoading(false);
      }
    }
    loadPetData();
  }, [selectedPetId, clinicId]);

  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets.filter((p) => p.isActive);
    return pets.filter(
      (p) =>
        p.isActive &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.owner?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.owner?.lastName.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [pets, searchTerm]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Extract separate lists for the tabs
  const petRecords = timeline.filter((t) => t.type === "MEDICAL");
  const petVaccinations = timeline.filter((t) => t.type === "VACCINE");
  const petPrescriptions = timeline.filter((t) => t.type === "PRESCRIPTION");

  return (
    <ProtectedRoute allowedRoles={["vet", "main_admin"]}>
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground mt-1">
            View medical history, vaccinations, appointments and VetBook
            timeline for any allocated pet.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Pet Selector Panel */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Patient</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pet or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading pets...
                </p>
              ) : filteredPets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pets found.
                </p>
              ) : (
                filteredPets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPetId === pet.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-transparent"
                    }`}
                  >
                    <div className="font-semibold text-sm">{pet.name}</div>
                    <div
                      className={`text-xs ${selectedPetId === pet.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {pet.species} {pet.breed ? `· ${pet.breed}` : ""} · Owner:{" "}
                      {pet.owner?.firstName} {pet.owner?.lastName}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Records Panel */}
          <div className="space-y-6">
            {!selectedPetId ? (
              <Card className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Select a patient</p>
                  <p className="text-sm">
                    Choose a pet from the list to view their medical records.
                  </p>
                </div>
              </Card>
            ) : isPetLoading ? (
              <Card className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="font-medium">Loading details...</p>
                </div>
              </Card>
            ) : (
              <>
                {/* Pet Info Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {selectedPet?.name[0]}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">
                          {selectedPet?.name}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {selectedPet?.species} ·{" "}
                          {selectedPet?.breed || "Unknown breed"} ·{" "}
                          {selectedPet?.weight
                            ? `${selectedPet.weight}kg`
                            : "Weight N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {selectedPet?.owner?.firstName}{" "}
                          {selectedPet?.owner?.lastName}{" "}
                          {selectedPet?.owner?.phone &&
                            `(${selectedPet.owner.phone})`}
                          {selectedPet?.microchip &&
                            ` · Microchip: ${selectedPet.microchip}`}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge>{petRecords.length} Records</Badge>
                        <Badge variant="secondary">
                          {petVaccinations.length} Vaccines
                        </Badge>
                        <Badge variant="outline">
                          {petPrescriptions.length} Prescriptions
                        </Badge>
                        <Badge variant="outline">
                          {appointments.length} Appointments
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="medical">Medical Records</TabsTrigger>
                    <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                    <TabsTrigger value="prescriptions">
                      Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  </TabsList>

                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="space-y-4 mt-4">
                    {timeline.length === 0 ? (
                      <Card className="py-12 text-center text-muted-foreground">
                        No records found for this patient.
                      </Card>
                    ) : (
                      <div className="relative pl-6 border-l-2 border-muted space-y-6">
                        {timeline.map((item, idx) => (
                          <div key={idx} className="relative">
                            <div
                              className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                                item.type === "MEDICAL"
                                  ? "bg-blue-500 border-blue-300"
                                  : item.type === "VACCINE"
                                    ? "bg-green-500 border-green-300"
                                    : "bg-purple-500 border-purple-300"
                              }`}
                            />
                            <Card>
                              <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                  {item.type === "MEDICAL" ? (
                                    <FileText className="h-4 w-4 text-blue-500" />
                                  ) : item.type === "VACCINE" ? (
                                    <Syringe className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Activity className="h-4 w-4 text-purple-500" />
                                  )}
                                  <CardTitle className="text-sm">
                                    {item.type === "MEDICAL"
                                      ? item.diagnosis
                                      : item.type === "VACCINE"
                                        ? `Vaccination: ${item.vaccineName}`
                                        : `Prescription: ${item.medicineName}`}
                                  </CardTitle>
                                  <Badge
                                    variant="outline"
                                    className="ml-auto text-xs"
                                  >
                                    {new Date(
                                      item.recordDate,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="text-sm text-muted-foreground space-y-1">
                                {item.type === "MEDICAL" ? (
                                  <>
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
                                    {item.notes && (
                                      <p>
                                        <span className="font-medium text-foreground">
                                          Notes:
                                        </span>{" "}
                                        {item.notes}
                                      </p>
                                    )}
                                    <p className="text-xs">
                                      By Dr. {item.vet?.firstName}{" "}
                                      {item.vet?.lastName} at{" "}
                                      {item.clinic?.name}
                                    </p>
                                  </>
                                ) : item.type === "VACCINE" ? (
                                  <>
                                    <p>
                                      <span className="font-medium text-foreground">
                                        Batch:
                                      </span>{" "}
                                      {item.batchNumber}
                                    </p>
                                    {item.nextDueDate && (
                                      <p>
                                        <span className="font-medium text-foreground">
                                          Next Due:
                                        </span>{" "}
                                        {new Date(
                                          item.nextDueDate,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                    )}
                                    <p className="text-xs">
                                      By Dr. {item.administeredBy?.firstName}{" "}
                                      {item.administeredBy?.lastName} at{" "}
                                      {item.clinic?.name}
                                    </p>
                                  </>
                                ) : (
                                  <>
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
                                    <p className="text-xs">
                                      By Dr. {item.vet?.firstName}{" "}
                                      {item.vet?.lastName} at{" "}
                                      {item.clinic?.name}
                                    </p>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Medical Records Tab */}
                  <TabsContent value="medical" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Diagnosis</TableHead>
                              <TableHead>Treatment</TableHead>
                              <TableHead>Vet</TableHead>
                              <TableHead>Clinic</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {petRecords.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No medical records found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              petRecords.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell className="text-sm">
                                    {new Date(
                                      record.recordDate,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {record.diagnosis}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {record.treatment || "—"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    Dr. {record.vet?.firstName}{" "}
                                    {record.vet?.lastName}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {record.clinic?.name}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Vaccinations Tab */}
                  <TabsContent value="vaccinations" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Vaccine</TableHead>
                              <TableHead>Batch</TableHead>
                              <TableHead>Next Due</TableHead>
                              <TableHead>Administered By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {petVaccinations.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No vaccination records found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              petVaccinations.map((vac) => (
                                <TableRow key={vac.id}>
                                  <TableCell className="text-sm">
                                    {new Date(
                                      vac.recordDate,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {vac.vaccineName}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm text-muted-foreground">
                                    {vac.batchNumber}
                                  </TableCell>
                                  <TableCell>
                                    {vac.nextDueDate ? (
                                      <Badge
                                        variant={
                                          new Date(vac.nextDueDate) < new Date()
                                            ? "destructive"
                                            : "secondary"
                                        }
                                      >
                                        {new Date(
                                          vac.nextDueDate,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </Badge>
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    Dr. {vac.administeredBy?.firstName}{" "}
                                    {vac.administeredBy?.lastName}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Prescriptions Tab */}
                  <TabsContent value="prescriptions" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Medicine</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Vet</TableHead>
                              <TableHead>Clinic</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {petPrescriptions.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No prescriptions found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              petPrescriptions.map((pres) => (
                                <TableRow key={pres.id}>
                                  <TableCell className="text-sm">
                                    {new Date(
                                      pres.recordDate,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {pres.medicineName}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {pres.dosage || "—"}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {pres.frequency || "—"}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {pres.duration || "—"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    Dr. {pres.vet?.firstName}{" "}
                                    {pres.vet?.lastName}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {pres.clinic?.name || "—"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Appointments Tab */}
                  <TabsContent value="appointments" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Vet</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointments.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No appointments found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              appointments.map((apt) => (
                                <TableRow key={apt.id}>
                                  <TableCell className="text-sm">
                                    {new Date(apt.date).toLocaleString([], {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {apt.reason || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        apt.status === "COMPLETED"
                                          ? "default"
                                          : apt.status === "PENDING"
                                            ? "secondary"
                                            : apt.status === "CANCELLED"
                                              ? "destructive"
                                              : "outline"
                                      }
                                    >
                                      {apt.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {apt.vet
                                      ? `Dr. ${apt.vet.firstName} ${apt.vet.lastName}`
                                      : "—"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
