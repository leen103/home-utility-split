import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplets, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { SimulationNotice } from "@/components/metermate/SampleNotice";
import { UploadField, type PickedFile } from "@/components/metermate/UploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeterMate } from "@/lib/metermate/store";
import type { MeterKind, Utility } from "@/lib/metermate/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reading/")({
  head: () => ({
    meta: [
      { title: "บันทึกเลขมิเตอร์ — MeterMate" },
      {
        name: "description",
        content: "เลือกน้ำหรือไฟ มิเตอร์หลักหรือย่อย แล้วถ่ายรูป เลือกรูป หรือกรอกเลขเอง",
      },
      { property: "og:title", content: "บันทึกเลขมิเตอร์ — MeterMate" },
      { property: "og:description", content: "ถ่ายรูป เลือกรูป หรือกรอกเลขมิเตอร์เอง" },
    ],
  }),
  component: AddReading,
});

function AddReading() {
  const { activeMonth, role, saveReading, setDraft } = useMeterMate();
  const navigate = useNavigate();

  const [utility, setUtility] = useState<Utility>("electric");
  const [kind, setKind] = useState<MeterKind>(role === "owner" ? "sub" : "main");
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [manual, setManual] = useState("");
  const [reading, setReading] = useState(false);

  const existing = activeMonth.readings[utility][kind];
  const previous = existing?.previous ?? 0;

  const runOcr = async () => {
    if (!photo) return;
    setReading(true);
    await new Promise((r) => setTimeout(r, 1600));
    const delta = utility === "water" ? 18 + Math.floor(Math.random() * 14) : 340 + Math.floor(Math.random() * 220);
    const guess = previous + (kind === "sub" ? Math.round(delta * 0.35) : delta);
    setDraft({
      utility,
      kind,
      monthId: activeMonth.id,
      previous,
      current: guess,
      confidence: 0.82 + Math.random() * 0.15,
      source: "ocr",
      photoName: photo.name,
      photoDataUrl: photo.dataUrl,
    });
    setReading(false);
    void navigate({ to: "/reading/review" });
  };

  const saveManual = () => {
    const value = Number(manual);
    if (!manual || Number.isNaN(value)) {
      toast.error("กรุณากรอกเลขมิเตอร์เป็นตัวเลข");
      return;
    }
    if (value < previous) {
      toast.error("เลขปัจจุบันต้องไม่น้อยกว่าเลขครั้งก่อน");
      return;
    }
    saveReading(activeMonth.id, utility, kind, {
      previous,
      current: value,
      source: "manual",
    });
    toast.success("บันทึกเลขมิเตอร์แล้ว");
    void navigate({ to: role === "owner" ? "/owner" : "/tenant" });
  };

  return (
    <AppShell title="บันทึกเลขมิเตอร์" subtitle={activeMonth.label} showBack>
      <div className="space-y-5">
        <div>
          <Label className="text-sm font-semibold">ประเภท</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Choice
              active={utility === "water"}
              onClick={() => setUtility("water")}
              className="data-[on=true]:border-water data-[on=true]:bg-water-soft data-[on=true]:text-water"
            >
              <Droplets className="h-6 w-6" /> น้ำ
            </Choice>
            <Choice
              active={utility === "electric"}
              onClick={() => setUtility("electric")}
              className="data-[on=true]:border-electric data-[on=true]:bg-electric-soft data-[on=true]:text-electric-foreground"
            >
              <Zap className="h-6 w-6" /> ไฟ
            </Choice>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">มิเตอร์</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Choice active={kind === "main"} onClick={() => setKind("main")}>
              มิเตอร์หลัก
            </Choice>
            <Choice active={kind === "sub"} onClick={() => setKind("sub")}>
              มิเตอร์ย่อย
            </Choice>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {role === "owner"
              ? "ปกติเจ้าของบ้านเป็นผู้บันทึกมิเตอร์ย่อย"
              : "ปกติผู้เช่าเป็นผู้ถ่ายรูปมิเตอร์หลัก"}
          </p>
        </div>

        <div className="rounded-[20px] bg-muted px-4 py-3 text-sm">
          <span className="text-muted-foreground">เลขครั้งก่อน: </span>
          <span className="font-display text-lg font-bold">
            {previous.toLocaleString("th-TH")}
          </span>
          {existing ? (
            <p className="mt-1 text-xs text-muted-foreground">
              เลขล่าสุดที่บันทึกไว้เดือนนี้: {existing.current.toLocaleString("th-TH")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">ยังไม่มีการบันทึกเดือนนี้</p>
          )}
        </div>

        <div className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
          <UploadField
            label="ถ่ายรูปหรือเลือกรูปมิเตอร์"
            hint="ระบบจะจำลองการอ่านตัวเลขจากรูปให้ตรวจสอบก่อนยืนยัน"
            value={photo}
            onChange={setPhoto}
          />
          <Button
            className="h-12 w-full rounded-2xl text-base"
            disabled={!photo || reading}
            onClick={() => void runOcr()}
          >
            {reading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังอ่านรูป...
              </>
            ) : (
              "อ่านตัวเลขจากรูป"
            )}
          </Button>
          <SimulationNotice />
        </div>

        <div className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
          <Label htmlFor="manual" className="text-sm font-semibold">
            หรือกรอกเลขมิเตอร์เอง
          </Label>
          <Input
            id="manual"
            inputMode="numeric"
            placeholder="เช่น 12980"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="h-14 rounded-2xl text-center font-display text-2xl"
          />
          <Button
            variant="secondary"
            className="h-12 w-full rounded-2xl text-base"
            onClick={saveManual}
          >
            บันทึกเลขที่กรอกเอง
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Choice({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      data-on={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card text-sm font-semibold active:scale-95",
        "data-[on=true]:border-primary data-[on=true]:bg-primary/10 data-[on=true]:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}
