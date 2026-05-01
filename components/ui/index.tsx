// components/ui/index.tsx
"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

// ─── Skeleton loader ─────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-24 mt-1" />
      </div>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────
interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export function Rating({ value, max = 5, size = "md", showLabel, interactive, onChange }: RatingProps) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            "transition-colors",
            i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200",
            interactive && "cursor-pointer hover:fill-amber-300 hover:text-amber-300"
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
      {showLabel && (
        <span className="text-sm text-gray-600 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

// ─── Order Status Badge ───────────────────────────────────────
const ORDER_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: "รอดำเนินการ", cls: "badge-warning" },
  PAID:       { label: "ชำระแล้ว",    cls: "badge-success" },
  PROCESSING: { label: "กำลังเตรียม",  cls: "badge bg-blue-100 text-blue-700" },
  SHIPPED:    { label: "จัดส่งแล้ว",   cls: "badge bg-indigo-100 text-indigo-700" },
  DELIVERED:  { label: "ได้รับแล้ว",   cls: "badge-success" },
  CANCELLED:  { label: "ยกเลิก",       cls: "badge-danger" },
  REFUNDED:   { label: "คืนเงินแล้ว",  cls: "badge-gray" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const map = ORDER_STATUS_MAP[status] ?? { label: status, cls: "badge-gray" };
  return <span className={map.cls}>{map.label}</span>;
}

// ─── Empty State ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-gray-200 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-dark">{title}</h3>
      {description && <p className="text-text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
        className="btn-secondary btn-sm disabled:opacity-40">
        ← ก่อนหน้า
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)}
            className={cn("w-9 h-9 rounded-lg text-sm font-medium transition-colors",
              p === page ? "bg-primary-600 text-white" : "hover:bg-surface-secondary text-dark")}>
            {p}
          </button>
        )
      )}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}
        className="btn-secondary btn-sm disabled:opacity-40">
        ถัดไป →
      </button>
    </div>
  );
}
