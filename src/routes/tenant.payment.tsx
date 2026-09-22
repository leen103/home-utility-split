import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { MeterCheckCard } from "@/components/metermate/MeterCheckCard";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { UploadField, type PickedFile } from "@/components/metermate/UploadField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";
import { checkMonth } from "@/lib/metermate/validate";

export const Route = createFileRoute("/tenant/payment")({
  head: () => ({
    meta: [
      { title: "แจ้งชำระเงิน — MeterMate" },
      {
        name: "description",
        content: "ติ๊กว่าจ่ายแล้วพร้อมวันที่และหมายเหตุ หรืออัปโหลดสลิปให้เจ้าของตรวจสอบ",
      },
      { property: "og:title", content: "แจ้งชำระเงิน — MeterMate" },
      { property: "og:description", content: "แจ้งชำระค่าน้ำค่าไฟและดูสถานะการตรวจสอบ" },
    ],
  }),
  component: TenantPayment,
});

function TenantPayment() {
  const { activeMonth, months, rates, markPaid, submitSlip } = useMeterMate();
  const totals = monthTotals(activeMonth, rates);
  const issues = checkMonth(activeMonth, months);
  const blocking = issues.filter((i) => i.level === "error");

  const [paid, setPaid] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [slip, setSlip] = useState<PickedFile | null>(null);

  const status = activeMonth.payment.status;
  const done = status === "awaiting_review" || status === "paid";

  const guard = () => {
    if (blocking.length > 0) {
      toast.error("ข้อมูลมิเตอร์ยังไม่ถูกต้อง กรุณาแก้ไขก่อนแจ้งชำระ");
      return false;
    }
    return true;
  };

  const confirmPaid = () => {
    if (!guard()) return;
    if (!paid) {
      toast.error("กรุณาติ๊กยืนยันว่าชำระแล้ว");
      return;
    }
    if (!date) {
      toast.error("กรุณาระบุวันที่ชำระ");
      return;
    }
    markPaid(activeMonth.id, date, note || undefined);
    toast.success("ส่งการแจ้งชำระแล้ว รอเจ้าของตรวจสอบ");
  };

  const sendSlip = () => {
    if (!guard()) return;
    if (!slip) {
      toast.error("กรุณาแนบรูปสลิปก่อน");
      return;
    }
    submitSlip(activeMonth.id, slip.name, slip.dataUrl, note || undefined);
    toast.success("ส่งสลิปแล้ว รอเจ้าของตรวจสอบ");
  };

  return (
    <AppShell title="แจ้งชำระเงิน" subtitle={activeMonth.label}>
      <div className="space-y-4">
        <div className="rounded-[20px] bg-primary p-4 text-primary-foreground shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs opacity-90">ยอดที่ผู้เช่าต้องชำระ</p>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 font-display text-4xl font-bold">
            ฿{baht(totals.tenantTotal)}
          </p>
          <p className="mt-1 text-[11px] opacity-90">
            น้ำ ฿{baht(totals.water.tenant.total)} · ไฟ ฿{baht(totals.electric.tenant.total)}
          </p>
        </div>

        <MeterCheckCard month={activeMonth} history={months} />

        {done ? (
          <div className="space-y-2 rounded-[20px] border border-water/40 bg-water-soft p-4 text-sm text-water">
            <p className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4" />
              {status === "paid" ? "เจ้าของรับรองการชำระแล้ว" : "รอเจ้าของตรวจสอบ"}
            </p>
            <p className="text-xs">
              วันที่แจ้งชำระ {activeMonth.payment.paidAt ?? "-"}
              {activeMonth.payment.slipName ? ` · สลิป ${activeMonth.payment.slipName}` : ""}
            </p>
            {activeMonth.payment.note ? (
              <p className="text-xs">หมายเหตุ: {activeMonth.payment.note}</p>
            ) : null}
          </div>
        ) : (
          <>
            <section className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">วิธีที่ 1 · ติ๊กว่าจ่ายแล้ว</p>
              <label className="flex min-h-[48px] items-center gap-3 rounded-2xl bg-muted px-3">
                <Checkbox
                  checked={paid}
                  onCheckedChange={(v) => setPaid(v === true)}
                  className="h-6 w-6"
                />
                <span className="text-sm font-semibold">จ่ายแล้ว</span>
              </label>
              <div>
                <Label htmlFor="paid-date" className="text-sm font-semibold">
                  วันที่ชำระ
                </Label>
                <Input
                  id="paid-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 h-12 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="note" className="text-sm font-semibold">
                  หมายเหตุ
                </Label>
                <Textarea
                  id="note"
                  placeholder="เช่น โอนผ่านแอปธนาคาร เวลา 19:30"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 min-h-[80px] rounded-2xl"
                />
              </div>
              <Button className="h-12 w-full rounded-2xl text-base" onClick={confirmPaid}>
                ยืนยันว่าชำระแล้ว
              </Button>
            </section>

            <section className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">วิธีที่ 2 · แนบสลิป</p>
              <UploadField
                label="ถ่ายรูปหรือเลือกรูปสลิป"
                hint="เจ้าของจะเห็นรูปนี้ตอนตรวจสอบการชำระ"
                value={slip}
                onChange={setSlip}
              />
              <Button
                variant="secondary"
                className="h-12 w-full rounded-2xl text-base"
                onClick={sendSlip}
              >
                ส่งสลิปให้เจ้าของตรวจสอบ
              </Button>
            </section>
          </>
        )}

        <section className="space-y-2">
          <p className="text-sm font-semibold">ประวัติการชำระ</p>
          {months.map((m) => {
            const t = monthTotals(m, rates);
            return (
              <div
                key={m.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[20px] border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    ฿{baht(t.tenantTotal)}
                    {m.payment.paidAt ? ` · ชำระ ${m.payment.paidAt}` : ""}
                  </p>
                </div>
                <StatusBadge status={m.payment.status} />
              </div>
            );
          })}
        </section>

        <SampleNotice />
      </div>
    </AppShell>
  );
}
