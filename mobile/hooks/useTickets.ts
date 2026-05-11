import { useCallback, useEffect, useState } from "react";
import { api, SupportTicket } from "@/lib/api";

export function useTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createTicket = useCallback(
    async (data: {
      subject: string;
      description: string;
      assignedVetId: string;
      targetClinicId?: string;
    }) => {
      try {
        const ticket = await api.createTicket(data);
        setTickets((prev) => [ticket, ...prev]);
        return { data: ticket, error: null };
      } catch (error: any) {
        console.error("Failed to create ticket:", error);
        return { data: null, error: error.message || "Failed to create ticket" };
      }
    },
    []
  );

  return { tickets, loading, refetch, createTicket };
}
