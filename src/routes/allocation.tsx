import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/metermate/AppShell";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";

export const Route = createFileRoute("/allocation")({
  head: () => ({
    meta: [
      { title: "การแบ่งยอดเจ้าของและผู้เช่า — MeterMate" },
      {
        name: "description",
        content: "เปรียบเทียบยอดที่เจ้าของบ้านและผู้เช่าต้องจ่าย พร้อมสูตรและทุกบรรทัดค่าใช้จ่าย",
      },
      { property: "og:title", content: "การแบ่งยอดเจ้าของและผู้เช่า — MeterMate" },
      { property: "og:description", content: "ดูสูตรและรายการค่าใช้จ่ายของทั้งสองฝ่าย" },
    ],
  }),
  component: AllocationPage,
});

function AllocationPage() {
  const { activeMonth, rates } = useMeterMate();
  const t = monthTotals(activeMonth, rates);
  const share =
    t.grandTotal > 0 ? Math.round((t.tenantTotal / t.grandTotal) * 100) : 0;

  return (
    <AppShell title="การแบ่งยอด" subtitle={activeMonth.label} showBack>
      <div className="space-y-4">
        <MonthSelect />

        <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">ยอดรวมทั้งบิล</p>
          <p className="font-display text-3xl font-bold">฿{baht(t.grandTotal)}</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-water" style={{ width: `${share}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>ผู้เช่า {share}%</span>
            <span>เจ้าของ {100 - share}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">เจ้าของบ้าน</p>
            <p className="font-display text-2xl font-bold">฿{baht(t.ownerTotal)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">จ่ายตามมิเตอร์ย่อย</p>
          </div>
          <div className="rounded-[20px] border border-water/40 bg-water-soft p-4 shadow-card">
            <p className="text-xs text-water">ผู้เช่า</p>
            <p className="font-display text-2xl font-bold text-water">
              ฿{baht(t.tenantTotal)}
            </p>
            <p className="mt-1 text-[11px] text-water">จ่ายส่วนต่าง หลัก − ย่อย</p>
          </div>
        </div>

        <div className="rounded-[20px] bg-highlight p-4 text-[12px] leading-relaxed text-highlight-foreground">
          <p className="font-semibold">สูตรการแบ่ง</p>
          <p className="mt-1">หน่วยเจ้าของ = หน่วยมิเตอร์ย่อย</p>
          <p>หน่วยผู้เช่า = หน่วยมิเตอร์หลัก − หน่วยมิเตอร์ย่อย</p>
          <p>ค่าใช้หน่วย = คิดตามอัตราขั้นบันไดของหน่วยแต่ละฝ่าย</p>
          <p>Ft = อัตรา Ft × หน่วยของฝ่ายนั้น</p>
          <p>ค่าบริการ = ค่าบริการทั้งบิล ÷ 2</p>
          <p>VAT = (ค่าใช้หน่วย + Ft + ส่วนแบ่งค่าบริการ) × VAT%</p>
        </div>

        {(["water", "electric"] as const).map((u) => {
          const a = u === "water" ? t.water : t.electric;
          const unit = u === "water" ? "ลบ.ม." : "kWh";
          return (
            <div key={u} className="rounded-[20px] border border-border bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">{u === "water" ? "ค่าน้ำ" : "ค่าไฟ"}</p>
              <table className="mt-2 w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 text-left font-normal">รายการ</th>
                    <th className="py-1 text-right font-normal">เจ้าของ</th>
                    <th className="py-1 text-right font-normal">ผู้เช่า</th>
                  </tr>
                </thead>
                <tbody>
                  <TR label={`หน่วย (${unit})`} a={a.owner.units.toLocaleString("th-TH")} b={a.tenant.units.toLocaleString("th-TH")} />
                  <TR label="ค่าหน่วย" a={baht(a.owner.usage)} b={baht(a.tenant.usage)} />
                  <TR label="ค่า Ft" a={baht(a.owner.ft)} b={baht(a.tenant.ft)} />
                  <TR label="ค่าบริการ ÷2" a={baht(a.owner.service)} b={baht(a.tenant.service)} />
                  <TR label="VAT" a={baht(a.owner.vat)} b={baht(a.tenant.vat)} />
                  <TR label="รวม" a={baht(a.owner.total)} b={baht(a.tenant.total)} strong />
                </tbody>
              </table>
            </div>
          );
        })}

        <SampleNotice />
      </div>
    </AppShell>
  );
}

function TR({ label, a, b, strong }: { label: string; a: string; b: string; strong?: boolean }) {
  return (
    <tr className={strong ? "font-display font-bold" : ""}>
      <td className="py-1 text-left">{label}</td>
      <td className="py-1 text-right">{a}</td>
      <td className="py-1 text-right">{b}</td>
    </tr>
  );
}
