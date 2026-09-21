import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, FileText, Receipt, Wallet } from "lucide-react";
import { AppShell } from "@/components/metermate/AppShell";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { RoleSwitch } from "@/components/metermate/RoleSwitch";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { UtilitySummaryCard } from "@/components/metermate/UtilitySummaryCard";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";

export const Route = createFileRoute("/tenant/")({
  head: () => ({
    meta: [
      { title: "หน้าหลักผู้เช่า — MeterMate" },
      {
        name: "description",
        content: "ดูยอดที่ผู้เช่าต้องจ่าย ส่งรูปมิเตอร์หลัก บิลรวม และแจ้งชำระเงิน",
      },
      { property: "og:title", content: "หน้าหลักผู้เช่า — MeterMate" },
      { property: "og:description", content: "ยอดค่าน้ำค่าไฟส่วนของผู้เช่ารายเดือน" },
    ],
  }),
  component: TenantDashboard,
});

function TenantDashboard() {
  const { activeMonth, rates } = useMeterMate();
  const totals = monthTotals(activeMonth, rates);
  const status = activeMonth.payment.status;

  return (
    <AppShell title="สวัสดี ผู้เช่า" subtitle="ห้องเช่าหลังบ้าน" action={<RoleSwitch />}>
      <div className="space-y-4">
        <MonthSelect />

        <div className="rounded-[20px] bg-water p-4 text-water-foreground shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs opacity-90">ยอดที่คุณต้องจ่าย {activeMonth.label}</p>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 font-display text-4xl font-bold">
            ฿{baht(totals.tenantTotal)}
          </p>
          <p className="mt-2 text-[11px] opacity-90">
            คิดจาก “หน่วยมิเตอร์หลัก − หน่วยมิเตอร์ย่อย” ของแต่ละประเภท
          </p>
        </div>

        {status === "awaiting_review" ? (
          <div className="rounded-[20px] border border-water/40 bg-water-soft p-4 text-sm font-medium text-water">
            ส่งหลักฐานแล้ว รอเจ้าของตรวจสอบ
          </div>
        ) : null}
        {status === "paid" ? (
          <div className="rounded-[20px] border border-success/40 bg-success-soft p-4 text-sm font-medium text-success">
            เจ้าของรับรองการชำระเรียบร้อยแล้ว
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <UtilitySummaryCard utility="water" alloc={totals.water} role="tenant" />
          <UtilitySummaryCard utility="electric" alloc={totals.electric} role="tenant" />
        </div>

        <div className="space-y-2">
          <QuickLink
            to="/reading"
            icon={<Camera className="h-5 w-5" />}
            title="ถ่ายรูป/กรอกมิเตอร์หลัก"
            desc="น้ำและไฟของมิเตอร์หลัก"
          />
          <QuickLink
            to="/bill"
            icon={<FileText className="h-5 w-5" />}
            title="อัปโหลดบิลรวม"
            desc="รูปบิลค่าน้ำ/ค่าไฟที่ได้รับ"
          />
          <QuickLink
            to="/calc"
            icon={<Receipt className="h-5 w-5" />}
            title="ดูวิธีคิดยอด"
            desc="แยกน้ำ/ไฟ ทีละบรรทัด"
          />
          <QuickLink
            to="/tenant/payment"
            icon={<Wallet className="h-5 w-5" />}
            title="แจ้งชำระเงิน"
            desc="ติ๊กจ่ายแล้ว หรือแนบสลิป"
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
  to: "/reading" | "/bill" | "/calc" | "/tenant/payment";
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="grid min-h-[64px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3 shadow-card active:scale-[0.99]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-water-soft text-water">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
    </Link>
  );
}
