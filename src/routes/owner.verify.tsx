import { createFileRoute } from "@tanstack/react-router";
import { Check, ImageOff, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { MeterCheckCard } from "@/components/metermate/MeterCheckCard";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { Button } from "@/components/ui/button";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";
import type { MeterKind, Utility } from "@/lib/metermate/types";
import { checkMonth } from "@/lib/metermate/validate";

export const Route = createFileRoute("/owner/verify")({
  head: () => ({
    meta: [
      { title: "ตรวจสอบการชำระ — MeterMate" },
      {
        name: "description",
        content: "เจ้าของบ้านตรวจรูปมิเตอร์ สลิปการโอน และรับรองการชำระของผู้เช่า",
      },
      { property: "og:title", content: "ตรวจสอบการชำระ — MeterMate" },
      { property: "og:description", content: "ตรวจรูปมิเตอร์และสลิป แล้วรับรองการชำระ" },
    ],
  }),
  component: OwnerVerify,
});

const kindLabel: Record<MeterKind, string> = { main: "มิเตอร์หลัก", sub: "มิเตอร์ย่อย" };
const utilityLabel: Record<Utility, string> = { water: "น้ำ", electric: "ไฟ" };

function OwnerVerify() {
  const { activeMonth, months, rates, verifyPayment, rejectPayment } = useMeterMate();
  const totals = monthTotals(activeMonth, rates);
  const issues = checkMonth(activeMonth, months);
  const blocking = issues.filter((i) => i.level === "error");
  const p = activeMonth.payment;

  return (
    <AppShell title="ตรวจสอบการชำระ" subtitle={activeMonth.label}>
      <div className="space-y-4">
        <MonthSelect />

        <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">ยอดที่ผู้เช่าต้องชำระ</p>
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-1 font-display text-3xl font-bold">
            ฿{baht(totals.tenantTotal)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            แจ้งชำระ {p.paidAt ?? "-"}
            {p.verifiedAt ? ` · รับรอง ${p.verifiedAt}` : ""}
          </p>
          {p.note ? (
            <p className="mt-2 rounded-2xl bg-muted px-3 py-2 text-xs">
              หมายเหตุจากผู้เช่า: {p.note}
            </p>
          ) : null}
        </div>

        <MeterCheckCard month={activeMonth} history={months} />

        <section className="space-y-3">
          <p className="text-sm font-semibold">รูปมิเตอร์ที่บันทึกไว้</p>
          <div className="grid grid-cols-2 gap-3">
            {(["water", "electric"] as Utility[]).flatMap((u) =>
              (["main", "sub"] as MeterKind[]).map((k) => {
                const r = activeMonth.readings[u][k];
                return (
                  <div
                    key={`${u}-${k}`}
                    className="overflow-hidden rounded-[20px] border border-border bg-card"
                  >
                    {r?.photoDataUrl ? (
                      <img
                        src={r.photoDataUrl}
                        alt={`${kindLabel[k]}${utilityLabel[u]}`}
                        className="h-28 w-full bg-muted object-cover"
                      />
                    ) : (
                      <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-muted text-[11px] text-muted-foreground">
                        <ImageOff className="h-5 w-5" />
                        {r ? "ไม่มีรูป (กรอกเอง)" : "ยังไม่มีข้อมูล"}
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <p className="truncate text-xs font-semibold">
                        {kindLabel[k]}
                        {utilityLabel[u]}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {r
                          ? `${r.previous.toLocaleString("th-TH")} → ${r.current.toLocaleString("th-TH")}`
                          : "-"}
                        {r?.confidence
                          ? ` · ${Math.round(r.confidence * 100)}%`
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </section>

        <section className="space-y-2 rounded-[20px] border border-border bg-card p-4 shadow-card">
          <p className="text-sm font-semibold">สลิปการชำระ</p>
          {p.slipDataUrl ? (
            <img
              src={p.slipDataUrl}
              alt="สลิปการชำระ"
              className="h-56 w-full rounded-2xl bg-muted object-contain"
            />
          ) : p.slipName ? (
            <div className="rounded-2xl bg-muted px-3 py-6 text-center text-xs text-muted-foreground">
              {p.slipName} (ข้อมูลตัวอย่าง ไม่มีไฟล์รูปจริง)
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              ผู้เช่ายังไม่ได้แนบสลิป
            </div>
          )}
        </section>

        {blocking.length > 0 ? (
          <p className="rounded-[20px] border border-destructive/40 bg-destructive/10 px-3 py-3 text-[12px] text-destructive">
            ยังรับรองไม่ได้ เพราะข้อมูลมิเตอร์มี {blocking.length} จุดที่ต้องแก้ไขก่อน
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl text-base"
            disabled={p.status !== "awaiting_review" && p.status !== "paid"}
            onClick={() => {
              rejectPayment(activeMonth.id);
              toast("ส่งกลับให้ผู้เช่าแก้ไขแล้ว");
            }}
          >
            <X className="mr-1 h-5 w-5" /> ไม่ผ่าน
          </Button>
          <Button
            className="h-12 rounded-2xl text-base"
            disabled={p.status === "paid" || blocking.length > 0}
            onClick={() => {
              verifyPayment(activeMonth.id);
              toast.success("รับรองการชำระแล้ว");
            }}
          >
            <Check className="mr-1 h-5 w-5" /> รับรองการชำระ
          </Button>
        </div>

        <section className="space-y-2">
          <p className="text-sm font-semibold">ประวัติรายเดือน</p>
          {months.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[20px] border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.label}</p>
                <p className="text-xs text-muted-foreground">
                  ฿{baht(monthTotals(m, rates).tenantTotal)}
                  {m.payment.verifiedAt ? ` · รับรอง ${m.payment.verifiedAt}` : ""}
                </p>
              </div>
              <StatusBadge status={m.payment.status} />
            </div>
          ))}
        </section>

        <SampleNotice />
      </div>
    </AppShell>
  );
}
