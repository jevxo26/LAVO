"use client";

import * as React from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";
import { type AdminRecord, type CrudModuleConfig } from "./types";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string })?.message || fallback;
  }
  return fallback;
}

export function useCrudData<TRecord extends AdminRecord>(
  config: CrudModuleConfig<TRecord>,
  search: string,
) {
  const [records, setRecords]   = React.useState<TRecord[]>(config.data || []);
  const [isLoading, setLoading] = React.useState(true);

  const token        = useAppSelector((s) => s.auth.token);
  const isAuthLoading = useAppSelector((s) => s.auth.isLoading);
  const user         = useAppSelector((s) => s.auth.user);

  const headers = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = React.useCallback(async () => {
    if (!config.endpoint) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await axios.get(config.endpoint, { headers, params: { search } });
      if (res.data?.success) setRecords(res.data.data);
    } catch (err) {
      toast.error("Failed to load records from server.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, search, headers]);

  React.useEffect(() => {
    if (isAuthLoading) return;
    fetchData();
  }, [fetchData, isAuthLoading]);

  // ── Create ─────────────────────────────────────────────────────────────
  const handleCreate = async (values: TRecord, onDone: () => void) => {
    if (!config.endpoint) {
      setRecords((c) => [{ ...values, id: values.id || `${Date.now()}` }, ...c]);
      toast.success("Record created (Mock Mode)");
      onDone();
      return;
    }
    try {
      await axios.post(config.endpoint, values, { headers });
      toast.success("Record created successfully");
      onDone();
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create record"));
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────
  const handleUpdate = async (values: TRecord, onDone: () => void) => {
    if (!config.endpoint) {
      setRecords((c) => c.map((r) => (r.id === values.id ? values : r)));
      toast.success("Record updated (Mock Mode)");
      onDone();
      return;
    }
    try {
      await axios.patch(`${config.endpoint}/${values.id}`, values, { headers });
      toast.success("Record updated successfully");
      onDone();
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update record"));
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (record: TRecord, onDone: () => void) => {
    if (!config.endpoint) {
      setRecords((c) => c.filter((r) => r.id !== record.id));
      toast.success("Record deleted (Mock Mode)");
      onDone();
      return;
    }
    try {
      await axios.delete(`${config.endpoint}/${record.id}`, { headers });
      toast.success("Record deleted successfully");
      onDone();
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete record"));
    }
  };

  // ── Role helpers ───────────────────────────────────────────────────────
  const isSuperAdmin = !!(
    user?.userType?.toUpperCase() === "SUPER_ADMIN" ||
    (user as any)?.role?.toUpperCase() === "SUPER_ADMIN"
  );
  const isNormalAdmin = !!(
    user?.userType?.toUpperCase() === "ADMIN" ||
    (user as any)?.role?.toUpperCase() === "ADMIN"
  );
  const isUserModule  =
    config.endpoint?.includes("users") ||
    config.title?.toLowerCase().includes("user");
  const isReadOnly = isNormalAdmin && !isSuperAdmin && !!isUserModule;

  return { records, isLoading, isReadOnly, handleCreate, handleUpdate, handleDelete };
}
