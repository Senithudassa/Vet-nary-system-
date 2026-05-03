"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Search, Stethoscope, FileText, Syringe, Calendar } from "lucide-react";
import { mockPets, mockMedicalRecords, mockVaccinations } from "@/lib/mock-data";
import type { Pet, MedicalRecord, Vaccination } from "@/lib/types";

export default function RecordsPage() {
    const [selectedPetId, setSelectedPetId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPets = useMemo(() => {
        if (!searchTerm) return mockPets.filter(p => p.isActive);
        return mockPets.filter(p =>
            p.isActive && (
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.owner?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.owner?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm]);

    const selectedPet = mockPets.find(p => p.id === selectedPetId);
    const petRecords = mockMedicalRecords.filter(r => r.petId === selectedPetId);
    const petVaccinations = mockVaccinations.filter(v => v.petId === selectedPetId);

    // Combine into timeline, sorted by date descending
    const timeline = useMemo(() => {
        const items: Array<{ type: "medical" | "vaccination"; date: string; data: MedicalRecord | Vaccination }> = [
            ...petRecords.map(r => ({ type: "medical" as const, date: r.recordDate, data: r })),
            ...petVaccinations.map(v => ({ type: "vaccination" as const, date: v.recordDate, data: v })),
        ];
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedPetId]);

    return (
        <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
            <div className="space-y-6 p-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
                    <p className="text-muted-foreground mt-1">View medical history, vaccinations, and VetBook timeline for any registered pet.</p>
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
                            {filteredPets.map(pet => (
                                <button
                                    key={pet.id}
                                    onClick={() => setSelectedPetId(pet.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedPetId === pet.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "hover:bg-muted border-transparent"
                                        }`}
                                >
                                    <div className="font-semibold text-sm">{pet.name}</div>
                                    <div className={`text-xs ${selectedPetId === pet.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                        {pet.species} {pet.breed ? `· ${pet.breed}` : ""} · Owner: {pet.owner?.firstName} {pet.owner?.lastName}
                                    </div>
                                </button>
                            ))}
                            {filteredPets.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No pets found.</p>
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
                                    <p className="text-sm">Choose a pet from the list to view their medical records.</p>
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
                                                <h2 className="text-xl font-bold">{selectedPet?.name}</h2>
                                                <p className="text-muted-foreground text-sm">
                                                    {selectedPet?.species} · {selectedPet?.breed || "Unknown breed"} · {selectedPet?.weight ? `${selectedPet.weight}kg` : "Weight N/A"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Owner: {selectedPet?.owner?.firstName} {selectedPet?.owner?.lastName} ({selectedPet?.owner?.phone})
                                                    {selectedPet?.microchip && ` · Microchip: ${selectedPet.microchip}`}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge>{petRecords.length} Records</Badge>
                                                <Badge variant="secondary">{petVaccinations.length} Vaccines</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Tabs defaultValue="timeline" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                        <TabsTrigger value="medical">Medical Records</TabsTrigger>
                                        <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                                    </TabsList>

                                    {/* Timeline Tab */}
                                    <TabsContent value="timeline" className="space-y-4 mt-4">
                                        {timeline.length === 0 ? (
                                            <Card className="py-12 text-center text-muted-foreground">No records found for this patient.</Card>
                                        ) : (
                                            <div className="relative pl-6 border-l-2 border-muted space-y-6">
                                                {timeline.map((item, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${item.type === "medical"
                                                            ? "bg-blue-500 border-blue-300"
                                                            : "bg-green-500 border-green-300"
                                                            }`} />
                                                        <Card>
                                                            <CardHeader className="pb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {item.type === "medical" ? (
                                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                                    ) : (
                                                                        <Syringe className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                    <CardTitle className="text-sm">
                                                                        {item.type === "medical"
                                                                            ? (item.data as MedicalRecord).diagnosis
                                                                            : `Vaccination: ${(item.data as Vaccination).vaccineName}`
                                                                        }
                                                                    </CardTitle>
                                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                                    </Badge>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                                                {item.type === "medical" ? (
                                                                    <>
                                                                        {(item.data as MedicalRecord).treatment && (
                                                                            <p><span className="font-medium text-foreground">Treatment:</span> {(item.data as MedicalRecord).treatment}</p>
                                                                        )}
                                                                        {(item.data as MedicalRecord).prescription && (
                                                                            <p><span className="font-medium text-foreground">Prescription:</span> {(item.data as MedicalRecord).prescription}</p>
                                                                        )}
                                                                        {(item.data as MedicalRecord).notes && (
                                                                            <p><span className="font-medium text-foreground">Notes:</span> {(item.data as MedicalRecord).notes}</p>
                                                                        )}
                                                                        <p className="text-xs">By Dr. {(item.data as MedicalRecord).vet?.firstName} {(item.data as MedicalRecord).vet?.lastName} at {(item.data as MedicalRecord).clinic?.name}</p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <p><span className="font-medium text-foreground">Batch:</span> {(item.data as Vaccination).batchNumber}</p>
                                                                        {(item.data as Vaccination).nextDueDate && (
                                                                            <p><span className="font-medium text-foreground">Next Due:</span> {new Date((item.data as Vaccination).nextDueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                                                        )}
                                                                        <p className="text-xs">By Dr. {(item.data as Vaccination).administeredBy?.firstName} {(item.data as Vaccination).administeredBy?.lastName} at {(item.data as Vaccination).clinic?.name}</p>
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
                                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No medical records found.</TableCell>
                                                            </TableRow>
                                                        ) : petRecords.map(record => (
                                                            <TableRow key={record.id}>
                                                                <TableCell className="text-sm">{new Date(record.recordDate).toLocaleDateString()}</TableCell>
                                                                <TableCell className="font-medium">{record.diagnosis}</TableCell>
                                                                <TableCell className="text-muted-foreground text-sm">{record.treatment || "—"}</TableCell>
                                                                <TableCell className="text-sm">Dr. {record.vet?.firstName} {record.vet?.lastName}</TableCell>
                                                                <TableCell className="text-sm text-muted-foreground">{record.clinic?.name}</TableCell>
                                                            </TableRow>
                                                        ))}
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
                                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No vaccination records found.</TableCell>
                                                            </TableRow>
                                                        ) : petVaccinations.map(vac => (
                                                            <TableRow key={vac.id}>
                                                                <TableCell className="text-sm">{new Date(vac.recordDate).toLocaleDateString()}</TableCell>
                                                                <TableCell className="font-medium">{vac.vaccineName}</TableCell>
                                                                <TableCell className="font-mono text-sm text-muted-foreground">{vac.batchNumber}</TableCell>
                                                                <TableCell>
                                                                    {vac.nextDueDate ? (
                                                                        <Badge variant={new Date(vac.nextDueDate) < new Date() ? "destructive" : "secondary"}>
                                                                            {new Date(vac.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                                        </Badge>
                                                                    ) : "—"}
                                                                </TableCell>
                                                                <TableCell className="text-sm">Dr. {vac.administeredBy?.firstName} {vac.administeredBy?.lastName}</TableCell>
                                                            </TableRow>
                                                        ))}
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
