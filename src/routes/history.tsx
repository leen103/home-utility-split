import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/metermate/AppShell";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "ประวัติรายเดือน — MeterMate" },
      {
        name: "description",
        content: "ดูประวัติค่าน้ำค่าไฟและสถานะการชำระย้อนหลังหลายเดือน",
      },
      { property: "og:title", content: "ประวัติรายเดือน — MeterMate" },
      { property: "og:description", content: "ยอดและสถานะการชำระย้อนหลังของแต่ละเดือน" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { months, rates, role, setActiveMonthId } = useMeterMate();
  const navigate = useNavigate();

  return (
    <AppShell title="ประวัติรายเดือน" subtitle="ย้อนหลังทุกเดือนที่บันทึกไว้" showBack>
      <div className="space-y-3">
        {months.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีประวัติการใช้งาน
          </div>
        ) : null}

        {months.map((m) => {
          const t = monthTotals(m, rates);
          const mine = role === "owner" ? t.ownerTotal : t.tenantTotal;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveMonthId(m.id);
                void navigate({ to: "/calc" });
              }}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border border-border bg-card p-4 text-left shadow-card active:scale-[0.99]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{m.label}</p>
                  <StatusBadge status={m.payment.status} />
                </div>
                <p className="mt-1 font-display text-2xl font-bold">฿{baht(mine)}</p>
                <p className="text-xs text-muted-foreground">
                  ยอดรวมทั้งบิล ฿{baht(t.grandTotal)}
                  {m.payment.paidAt ? ` · ชำระ ${m.payment.paidAt}` : ""}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          );
        })}

        <SampleNotice />
      </div>
    </AppShell>
  );
}
