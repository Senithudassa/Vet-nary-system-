import { useCallback, useEffect, useState } from "react";
import { api, Appointment } from "@/lib/api";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      setError(err.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { appointments, loading, error, refetch };
}
