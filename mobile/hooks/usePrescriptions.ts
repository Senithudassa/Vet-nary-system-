import { useCallback, useEffect, useState } from "react";
import { Prescription, api } from "@/lib/api";
import { Pet } from "@/hooks/usePets";

export interface PetWithPrescriptions {
  pet: Pet;
  prescriptions: Prescription[];
}

export function usePrescriptions(pets: Pet[]) {
  const [data, setData] = useState<PetWithPrescriptions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (pets.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        pets.map(async (pet) => {
          try {
            const prescriptions = await api.getPetPrescriptions(pet.id);
            return { pet, prescriptions: prescriptions ?? [] };
          } catch {
            return { pet, prescriptions: [] };
          }
        })
      );
      setData(results);
    } catch (err: any) {
      console.error("Failed to fetch prescriptions:", err);
      setError(err.message || "Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  }, [pets]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}
