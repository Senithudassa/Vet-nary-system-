"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { PawPrint, Plus, Search, Eye, Loader2 } from "lucide-react";
import type { Pet } from "@/lib/types";
import { toast } from "sonner";
import { petService } from "@/app/services/pet.service";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingPet, setViewingPet] = useState<Pet | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // New pet form state
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    weight: "",
    microchip: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  const species = useMemo(() => {
    const s = new Set(pets.map((p) => p.species));
    return Array.from(s).sort();
  }, [pets]);

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        p.owner?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        p.microchip?.toLowerCase().includes(search.toLowerCase());
      const matchSpecies =
        speciesFilter === "ALL" || p.species === speciesFilter;
      return matchSearch && matchSpecies;
    });
  }, [pets, search, speciesFilter]);

  const stats = useMemo(
    () => ({
      total: pets.length,
      active: pets.filter((p) => p.isActive).length,
      dogs: pets.filter((p) => p.species === "Dog").length,
      cats: pets.filter((p) => p.species === "Cat").length,
    }),
    [pets],
  );

  useEffect(() => {
    const loadPets = async () => {
      try {
        setIsLoading(true);
        const data = await petService.getPetsForVet();
        setPets(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load pets");
      } finally {
        setIsLoading(false);
      }
    };
    loadPets();
  }, []);

  const handleViewPet = async (pet: Pet) => {
    setViewingPet(pet);
    setIsLoadingDetails(true);
    try {
      const data = await petService.getPetDetails(pet.id);
      setViewingPet(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load pet details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAddPet = () => {
    if (!newPet.name || !newPet.species) {
      toast.error("Pet name and species are required.");
      return;
    }

    const pet: Pet = {
      id: `p-${Date.now()}`,
      ownerId: `u-temp-${Date.now()}`,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed || undefined,
      weight: newPet.weight ? parseFloat(newPet.weight) : undefined,
      microchip: newPet.microchip || undefined,
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        firstName: newPet.ownerFirstName || "Unknown",
        lastName: newPet.ownerLastName || "Owner",
        email: newPet.ownerEmail || "",
        phone: newPet.ownerPhone || "",
      },
    };

    setPets((prev) => [pet, ...prev]);
    toast.success(`${pet.name} has been registered successfully.`);
    setNewPet({
      name: "",
      species: "",
      breed: "",
      weight: "",
      microchip: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      ownerPhone: "",
    });
    setIsAddOpen(false);
  };

  return (
    <ProtectedRoute allowedRoles={["main_admin", "vet"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pet Registry</h1>
            <p className="text-muted-foreground mt-1">
              Manage all registered pets and their owner information.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Register New Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Register New Pet</DialogTitle>
                <DialogDescription>
                  Add a new pet and link them to their owner.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Pet Name *</Label>
                    <Input
                      placeholder="e.g. Max"
                      value={newPet.name}
                      onChange={(e) =>
                        setNewPet((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Species *</Label>
                    <Select
                      value={newPet.species}
                      onValueChange={(v) =>
                        setNewPet((p) => ({ ...p, species: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Breed</Label>
                    <Input
                      placeholder="e.g. Golden Retriever"
                      value={newPet.breed}
                      onChange={(e) =>
                        setNewPet((p) => ({ ...p, breed: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 25.5"
                      value={newPet.weight}
                      onChange={(e) =>
                        setNewPet((p) => ({ ...p, weight: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Microchip ID</Label>
                  <Input
                    placeholder="e.g. MC-001122"
                    value={newPet.microchip}
                    onChange={(e) =>
                      setNewPet((p) => ({ ...p, microchip: e.target.value }))
                    }
                  />
                </div>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium mb-3">Owner Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="John"
                        value={newPet.ownerFirstName}
                        onChange={(e) =>
                          setNewPet((p) => ({
                            ...p,
                            ownerFirstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Doe"
                        value={newPet.ownerLastName}
                        onChange={(e) =>
                          setNewPet((p) => ({
                            ...p,
                            ownerLastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="john@email.com"
                        value={newPet.ownerEmail}
                        onChange={(e) =>
                          setNewPet((p) => ({
                            ...p,
                            ownerEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        placeholder="07X XXX XXXX"
                        value={newPet.ownerPhone}
                        onChange={(e) =>
                          setNewPet((p) => ({
                            ...p,
                            ownerPhone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPet}>Register Pet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cats}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Registered Pets</CardTitle>
            <CardDescription>
              Browse and manage all pets in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pet name, owner, or microchip..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Species</SelectItem>
                  {species.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No pets match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pet) => (
                    <TableRow
                      key={pet.id}
                      className={!pet.isActive ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pet.species}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pet.breed || "—"}
                      </TableCell>
                      <TableCell>
                        {pet.weight ? `${pet.weight} kg` : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pet.owner?.firstName} {pet.owner?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pet.isActive ? "default" : "secondary"}
                          className={
                            pet.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                        >
                          {pet.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPet(pet)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{viewingPet?.name}</DialogTitle>
                              <DialogDescription>
                                Pet details and owner information
                              </DialogDescription>
                            </DialogHeader>
                            {isLoadingDetails && !viewingPet?.owner?.email ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              viewingPet && (
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-medium">
                                        Species:
                                      </span>{" "}
                                      {viewingPet.species}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Breed:
                                      </span>{" "}
                                      {viewingPet.breed || "—"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Weight:
                                      </span>{" "}
                                      {viewingPet.weight
                                        ? `${viewingPet.weight} kg`
                                        : "—"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Microchip:
                                      </span>{" "}
                                      {viewingPet.microchip || "—"}
                                    </div>
                                  </div>
                                  <div className="border-t pt-3">
                                    <p className="font-medium mb-2">Owner</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        {viewingPet.owner?.firstName}{" "}
                                        {viewingPet.owner?.lastName}
                                      </div>
                                      <div>
                                        {viewingPet.owner?.phone || "—"}
                                      </div>
                                      <div className="col-span-2">
                                        {viewingPet.owner?.email || "—"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="border-t pt-3 text-xs text-muted-foreground">
                                    Registered:{" "}
                                    {new Date(
                                      viewingPet.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              )
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filtered.length} of {pets.length} pets
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
