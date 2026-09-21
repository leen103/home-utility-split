import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplets, HomeIcon, Sparkles, UserRound, Zap } from "lucide-react";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { useMeterMate } from "@/lib/metermate/store";
import type { Role } from "@/lib/metermate/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MeterMate — เลือกบทบาทเจ้าของหรือผู้เช่า" },
      {
        name: "description",
        content:
          "เริ่มใช้งาน MeterMate เลือกบทบาทเจ้าของบ้านหรือผู้เช่า เพื่อแบ่งค่าน้ำค่าไฟจากมิเตอร์หลักและมิเตอร์ย่อย",
      },
      { property: "og:title", content: "MeterMate — เลือกบทบาท" },
      {
        property: "og:description",
        content: "แบ่งค่าน้ำค่าไฟระหว่างเจ้าของบ้านกับผู้เช่า ใช้งานง่ายบนมือถือ",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { setRole } = useMeterMate();
  const navigate = useNavigate();

  const choose = (role: Role) => {
    setRole(role);
    void navigate({ to: role === "owner" ? "/owner" : "/tenant" });
  };

  return (
    <div className="min-h-screen w-full bg-muted/40 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-background px-5 py-8 shadow-card sm:min-h-0 sm:rounded-[28px] sm:border sm:border-border">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary font-display text-3xl font-bold text-primary-foreground">
          M
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold leading-snug">MeterMate</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          แบ่งค่าน้ำและค่าไฟระหว่าง “เจ้าของบ้าน” กับ “ผู้เช่า” จากมิเตอร์หลักและมิเตอร์ย่อย
          คิดยอดให้อัตโนมัติ โปร่งใสทั้งสองฝ่าย
        </p>

        <div className="mt-5 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-water-soft px-3 py-1 text-xs font-semibold text-water">
            <Droplets className="h-4 w-4" /> ค่าน้ำ
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-electric-soft px-3 py-1 text-xs font-semibold text-electric-foreground">
            <Zap className="h-4 w-4" /> ค่าไฟ
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4" /> ไม่ต้องสมัคร
          </span>
        </div>

        <p className="mt-7 text-sm font-semibold">คุณคือใคร?</p>
        <div className="mt-3 space-y-3">
          <button
            onClick={() => choose("owner")}
            className="flex w-full items-center gap-4 rounded-[20px] border border-border bg-card p-4 text-left shadow-card transition active:scale-[0.98]"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <HomeIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold">เจ้าของบ้าน</p>
              <p className="text-xs text-muted-foreground">
                กรอกมิเตอร์ย่อย ตรวจสลิป และตั้งค่าอัตรา
              </p>
            </div>
          </button>

          <button
            onClick={() => choose("tenant")}
            className="flex w-full items-center gap-4 rounded-[20px] border border-border bg-card p-4 text-left shadow-card transition active:scale-[0.98]"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-water-soft text-water">
              <UserRound className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold">ผู้เช่า</p>
              <p className="text-xs text-muted-foreground">
                ถ่ายรูปมิเตอร์หลัก ส่งบิลรวม และแจ้งชำระเงิน
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <SampleNotice />
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            ในอนาคตแต่ละบ้านจะเข้าใช้งานผ่านลิงก์เฉพาะ (token)
            แต่ในตัวอย่างนี้สลับบทบาทได้จากหน้าจอได้ตลอด
          </p>
        </div>
      </div>
    </div>
  );
}
