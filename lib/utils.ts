import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateRefNo(
  warehouseCode: string,
  type: string,
  sequence: number
): string {
  const typeMap: Record<string, string> = {
    Receipt: "IN",
    Delivery: "OUT",
    Internal: "INT",
    Adjustment: "ADJ",
  };
  const typeCode = typeMap[type] || "OP";
  return `${warehouseCode}/${typeCode}/${String(sequence).padStart(5, "0")}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Waiting: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Ready: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return map[status] || "bg-slate-500/20 text-slate-300";
}

export function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    Receipt: "bg-green-500/20 text-green-300 border-green-500/30",
    Delivery: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Internal: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    Adjustment: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return map[type] || "bg-slate-500/20 text-slate-300";
}
