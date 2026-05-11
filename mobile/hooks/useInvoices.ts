import { useCallback, useEffect, useState } from "react";
import { api, Invoice } from "@/lib/api";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyInvoices();
      setInvoices(data);
    } catch (err: any) {
      console.error("Failed to fetch invoices:", err);
      setError(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { invoices, loading, error, refetch };
}
