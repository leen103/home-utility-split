import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/metermate/types";

const map: Record<PaymentStatus, { label: string; className: string }> = {
  awaiting_data: {
    label: "รอข้อมูล",
    className: "bg-muted text-muted-foreground border-border",
  },
  awaiting_payment: {
    label: "รอชำระ",
    className: "bg-highlight text-highlight-foreground border-electric/40",
  },
  awaiting_review: {
    label: "รอตรวจสอบ",
    className: "bg-water-soft text-water border-water/40",
  },
  paid: {
    label: "ชำระแล้ว",
    className: "bg-success-soft text-success border-success/40",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}

export const statusLabel = (s: PaymentStatus) => map[s].label;
