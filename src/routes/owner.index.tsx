import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileText, Receipt, Settings, Users } from "lucide-react";
import { AppShell } from "@/components/metermate/AppShell";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { RoleSwitch } from "@/components/metermate/RoleSwitch";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { UtilitySummaryCard } from "@/components/metermate/UtilitySummaryCard";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";

export const Route = createFileRoute("/owner/")({
  head: () => ({
    meta: [
      { title: "หน้าหลักเจ้าของบ้าน — MeterMate" },
      {
        name: "description",
        content: "สรุปยอดค่าน้ำค่าไฟของเจ้าของบ้านและผู้เช่าในแต่ละเดือน",
      },
      { property: "og:title", content: "หน้าหลักเจ้าของบ้าน — MeterMate" },
      { property: "og:description", content: "สรุปยอดแบ่งค่าน้ำค่าไฟรายเดือน" },
    ],
  }),
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const { activeMonth, rates } = useMeterMate();
  const totals = monthTotals(activeMonth, rates);

  return (
    <AppShell
      title="สวัสดี เจ้าของบ้าน"
      subtitle="บ้านเลขที่ 89/12 ซอยร่มเย็น"
      action={<RoleSwitch />}
    >
      <div className="space-y-4">
        <MonthSelect />

        <div className="rounded-[20px] bg-primary p-4 text-primary-foreground shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs opacity-90">ยอดรวมทั้งบิล {activeMonth.label}</p>
            <StatusBadge status={activeMonth.payment.status} />
          </div>
          <p className="mt-1 font-display text-4xl font-bold">
            ฿{baht(totals.grandTotal)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-[11px] opacity-90">ส่วนของคุณ (มิเตอร์ย่อย)</p>
              <p className="font-display text-xl font-bold">฿{baht(totals.ownerTotal)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-[11px] opacity-90">ส่วนของผู้เช่า</p>
              <p className="font-display text-xl font-bold">
                ฿{baht(totals.tenantTotal)}
              </p>
            </div>
          </div>
        </div>

        {!totals.ready ? (
          <div className="rounded-[20px] border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            ยังกรอกเลขมิเตอร์ไม่ครบ ยอดที่แสดงจึงยังไม่สมบูรณ์
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <UtilitySummaryCard utility="water" alloc={totals.water} role="owner" />
          <UtilitySummaryCard utility="electric" alloc={totals.electric} role="owner" />
        </div>

        <div className="space-y-2">
          <QuickLink
            to="/reading"
            icon={<Camera className="h-5 w-5" />}
            title="กรอก/ถ่ายรูปมิเตอร์ย่อย"
            desc="น้ำและไฟของส่วนเจ้าของ"
          />
          <QuickLink
            to="/bill"
            icon={<FileText className="h-5 w-5" />}
            title="อัปโหลดบิลรวม"
            desc="บิลค่าน้ำ/ค่าไฟใบเดียวของทั้งบ้าน"
          />
          <QuickLink
            to="/calc"
            icon={<Receipt className="h-5 w-5" />}
            title="รายละเอียดการคำนวณ"
            desc="ดูทีละบรรทัด แยกน้ำ/ไฟ"
          />
          <QuickLink
            to="/owner/verify"
            icon={<Users className="h-5 w-5" />}
            title="ตรวจสอบการชำระของผู้เช่า"
            desc="ดูรูปมิเตอร์ สลิป และรับรองการชำระ"
          />
          <QuickLink
            to="/owner/rates"
            icon={<Settings className="h-5 w-5" />}
            title="ตั้งค่าอัตรา (ตัวอย่าง)"
            desc="อัตราขั้นบันได, Ft, ค่าบริการ, VAT"
          />
        </div>

        <SampleNotice />
      </div>
    </AppShell>
  );
}

function QuickLink({
  to,
  icon,
  title,
  desc,
}: {
  to: "/reading" | "/bill" | "/calc" | "/owner/verify" | "/owner/rates";
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="grid min-h-[64px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3 shadow-card active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
    </Link>
  );
}
