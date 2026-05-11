import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface MedicalRecord {
  id: string;
  petId: string;
  vetId?: string;
  clinicId: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  administeredById?: string;
  vaccineName?: string;
  batchNumber?: string;
  nextDueDate?: string;
  recordDate: string;
  createdAt: string;
  type: 'MEDICAL' | 'VACCINE';
  clinic?: any;
  vet?: any;
  administeredBy?: any;
}

export function useVetBook(petId: string | null) {
  const [data, setData] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!petId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.getVetBook(petId);
      setData(result || []);
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
