import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Zap } from "lucide-react";
import { AppShell } from "@/components/metermate/AppShell";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allocate, baht } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";
import type { Utility } from "@/lib/metermate/types";

export const Route = createFileRoute("/calc")({
  head: () => ({
    meta: [
      { title: "รายละเอียดการคำนวณรายเดือน — MeterMate" },
      {
        name: "description",
        content: "ดูการคำนวณค่าน้ำและค่าไฟรายเดือน ทั้งหน่วยที่ใช้ Ft ค่าบริการ และ VAT",
      },
      { property: "og:title", content: "รายละเอียดการคำนวณรายเดือน — MeterMate" },
      { property: "og:description", content: "แยกน้ำ/ไฟ ทีละบรรทัดอย่างโปร่งใส" },
    ],
  }),
  component: CalcPage,
});

function CalcPage() {
  const { activeMonth } = useMeterMate();
  return (
    <AppShell title="รายละเอียดการคำนวณ" subtitle={activeMonth.label} showBack>
      <div className="space-y-4">
        <MonthSelect />
        <Tabs defaultValue="electric">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl">
            <TabsTrigger value="electric" className="h-10 rounded-xl">
              <Zap className="mr-1 h-4 w-4" /> ค่าไฟ
            </TabsTrigger>
            <TabsTrigger value="water" className="h-10 rounded-xl">
              <Droplets className="mr-1 h-4 w-4" /> ค่าน้ำ
            </TabsTrigger>
          </TabsList>
          <TabsContent value="electric" className="mt-4">
            <UtilityCalc utility="electric" />
          </TabsContent>
          <TabsContent value="water" className="mt-4">
            <UtilityCalc utility="water" />
          </TabsContent>
        </Tabs>
        <Link
          to="/allocation"
          className="flex min-h-12 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          ดูการแบ่งยอดเจ้าของ/ผู้เช่า
        </Link>
        <SampleNotice />
      </div>
    </AppShell>
  );
}

function UtilityCalc({ utility }: { utility: Utility }) {
  const { activeMonth, rates } = useMeterMate();
  const a = allocate(activeMonth, utility, rates);
  const r = rates[utility];
  const unit = utility === "water" ? "ลบ.ม." : "kWh";

  if (!a.ready) {
    return (
      <div className="rounded-[20px] border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        ยังไม่มีเลขมิเตอร์ครบทั้งหลักและย่อยของเดือนนี้
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
        <p className="text-sm font-semibold">หน่วยที่ใช้</p>
        <Row label="มิเตอร์หลัก" value={`${a.mainUnits.toLocaleString("th-TH")} ${unit}`} />
        <Row label="มิเตอร์ย่อย (เจ้าของ)" value={`${a.subUnits.toLocaleString("th-TH")} ${unit}`} />
        <Row
          label="ส่วนต่าง (ผู้เช่า)"
          value={`${a.tenantUnits.toLocaleString("th-TH")} ${unit}`}
          strong
        />
        <p className="mt-2 rounded-2xl bg-highlight px-3 py-2 text-[12px] text-highlight-foreground">
          สูตร: หน่วยผู้เช่า = หน่วยมิเตอร์หลัก − หน่วยมิเตอร์ย่อย
        </p>
      </div>

      <SideCard title="ส่วนของเจ้าของบ้าน" side={a.owner} vat={r.vat} ft={r.ft} service={r.service} unit={unit} />
      <SideCard title="ส่วนของผู้เช่า" side={a.tenant} vat={r.vat} ft={r.ft} service={r.service} unit={unit} />

      <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
        <Row label="รวมทั้งสองฝ่าย" value={`฿${baht(a.combined)}`} strong />
        <Row
          label="ยอดในบิลที่ได้รับ"
          value={a.billTotal !== null ? `฿${baht(a.billTotal)}` : "ยังไม่ได้อัปโหลด"}
        />
        {a.billTotal !== null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            ผลต่างจากบิลจริง ฿{baht(Math.abs(a.combined - a.billTotal))} —
            เกิดจากอัตราตัวอย่างที่ยังไม่ตรงกับประกาศจริง
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SideCard({
  title,
  side,
  vat,
  ft,
  service,
  unit,
}: {
  title: string;
  side: { units: number; usage: number; ft: number; service: number; subtotal: number; vat: number; total: number };
  vat: number;
  ft: number;
  service: number;
  unit: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      <Row label={`ค่าหน่วย (${side.units.toLocaleString("th-TH")} ${unit}, ขั้นบันได)`} value={`฿${baht(side.usage)}`} />
      <Row label={`ค่า Ft (${ft} × หน่วย)`} value={`฿${baht(side.ft)}`} />
      <Row label={`ค่าบริการ (฿${baht(service)} ÷ 2)`} value={`฿${baht(side.service)}`} />
      <Row label="รวมก่อน VAT" value={`฿${baht(side.subtotal)}`} />
      <Row label={`VAT ${Math.round(vat * 100)}%`} value={`฿${baht(side.vat)}`} />
      <div className="mt-2 flex items-center justify-between rounded-2xl bg-primary/10 px-3 py-2">
        <span className="text-sm font-semibold text-primary">รวมสุทธิ</span>
        <span className="font-display text-xl font-bold text-primary">฿{baht(side.total)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm">
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-base font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
