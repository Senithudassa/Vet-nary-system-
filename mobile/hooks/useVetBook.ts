import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface MedicalRecord {
  type: 'MEDICAL' | 'VACCINATION';
  diagnosis?: string;
  vaccineName?: string;
  date: string;
}

export interface VetBookData {
  pet: { name: string };
  records: MedicalRecord[];
}

export function useVetBook(petId: string | null) {
  const [data, setData] = useState<VetBookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!petId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.getVetBook(petId);
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch vet book:", err);
      setError(err.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { data, loading, error, refetch: fetchRecords };
}
