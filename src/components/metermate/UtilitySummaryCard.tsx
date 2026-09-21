import { Link } from "@tanstack/react-router";
import { ChevronRight, Droplets, Zap } from "lucide-react";
import { baht } from "@/lib/metermate/calc";
import type { UtilityAllocation, Utility, Role } from "@/lib/metermate/types";

export function UtilitySummaryCard({
  utility,
  alloc,
  role,
}: {
  utility: Utility;
  alloc: UtilityAllocation;
  role: Role;
}) {
  const isWater = utility === "water";
  const Icon = isWater ? Droplets : Zap;
  const side = role === "owner" ? alloc.owner : alloc.tenant;

  return (
    <Link
      to="/allocation"
      className="block rounded-[20px] border border-border bg-card p-4 shadow-card active:scale-[0.99]"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            isWater ? "bg-water-soft text-water" : "bg-electric-soft text-electric-foreground"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {isWater ? "ค่าน้ำ" : "ค่าไฟ"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {alloc.ready
              ? `ส่วนของคุณ ${side.units.toLocaleString("th-TH")} หน่วย`
              : "ยังไม่มีเลขมิเตอร์ครบ"}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold">
        {alloc.ready ? `฿${baht(side.total)}` : "—"}
      </p>
    </Link>
  );
}
