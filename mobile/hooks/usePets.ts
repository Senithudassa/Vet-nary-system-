import { useState, useCallback, useEffect } from 'react';

import { api } from '@/lib/api';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  weight?: number;
  owner_id?: string;
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPets();
      setPets(data);
    } catch (error) {
      console.error("Failed to fetch pets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addPet = useCallback(async (petData: Partial<Pet>) => {
    setLoading(true);
    try {
      const data = await api.addPet(petData);
      setPets(prev => [...prev, data]);
      return { data, error: null };
    } catch (error: any) {
      console.error("Failed to add pet:", error);
      return { data: null, error: error.message || 'Failed to add pet' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { pets, loading, refetch, addPet };
}
