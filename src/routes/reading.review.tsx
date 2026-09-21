import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { SimulationNotice } from "@/components/metermate/SampleNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useMeterMate } from "@/lib/metermate/store";

export const Route = createFileRoute("/reading/review")({
  head: () => ({
    meta: [
      { title: "ตรวจผลอ่านเลขมิเตอร์ — MeterMate" },
      {
        name: "description",
        content: "ตรวจตัวเลขที่อ่านได้จากรูปมิเตอร์ ความมั่นใจ และแก้ไขก่อนยืนยัน",
      },
      { property: "og:title", content: "ตรวจผลอ่านเลขมิเตอร์ — MeterMate" },
      { property: "og:description", content: "ตรวจและแก้เลขมิเตอร์ก่อนยืนยัน" },
    ],
  }),
  component: OcrReview,
});

function OcrReview() {
  const { draft, setDraft, saveReading, role } = useMeterMate();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (draft?.current != null) setValue(String(draft.current));
  }, [draft]);

  if (!draft) {
    return (
      <AppShell title="ตรวจผลอ่านเลข" showBack>
        <div className="space-y-4 rounded-[20px] border border-dashed border-border bg-card p-6 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            ยังไม่มีรูปที่รออ่าน กรุณาเริ่มจากหน้าบันทึกเลขมิเตอร์
          </p>
          <Button
            className="h-12 w-full rounded-2xl"
            onClick={() => void navigate({ to: "/reading" })}
          >
            ไปหน้าบันทึกเลขมิเตอร์
          </Button>
        </div>
      </AppShell>
    );
  }

  const num = Number(value);
  const valid = value !== "" && !Number.isNaN(num);
  const diff = valid ? num - draft.previous : 0;
  const tooLow = valid && num < draft.previous;
  const suspicious = valid && !tooLow && diff > (draft.utility === "water" ? 90 : 1200);
  const confidence = Math.round((draft.confidence ?? 0.9) * 100);
  const lowConfidence = confidence < 90;

  const confirm = () => {
    if (!valid || tooLow) {
      toast.error("กรุณาแก้เลขให้ถูกต้องก่อนยืนยัน");
      return;
    }
    saveReading(draft.monthId, draft.utility, draft.kind, {
      previous: draft.previous,
      current: num,
      source: "ocr",
      confidence: draft.confidence,
      photoName: draft.photoName,
      photoDataUrl: draft.photoDataUrl,
    });
    setDraft(null);
    toast.success("ยืนยันเลขมิเตอร์เรียบร้อย");
    void navigate({ to: role === "owner" ? "/owner" : "/tenant" });
  };

  return (
    <AppShell
      title="ตรวจผลอ่านเลข"
      subtitle={`${draft.utility === "water" ? "ค่าน้ำ" : "ค่าไฟ"} · มิเตอร์${draft.kind === "main" ? "หลัก" : "ย่อย"}`}
      showBack
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-card">
          {draft.photoDataUrl ? (
            <img
              src={draft.photoDataUrl}
              alt={draft.photoName ?? "รูปมิเตอร์"}
              className="h-48 w-full bg-muted object-cover"
            />
          ) : (
            <div className="grid h-48 w-full place-items-center bg-muted text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
          <p className="truncate px-4 py-2 text-xs text-muted-foreground">
            {draft.photoName ?? "ไม่มีชื่อไฟล์"}
          </p>
        </div>

        <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">ตัวเลขที่ระบบอ่านได้ (จำลอง)</p>
          <p className="mt-1 font-display text-4xl font-bold tracking-wide">
            {draft.current?.toLocaleString("th-TH")}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">ความมั่นใจ</span>
            <span className={lowConfidence ? "font-semibold text-destructive" : "font-semibold text-success"}>
              {confidence}%
            </span>
          </div>
          <Progress value={confidence} className="mt-2 h-2" />
          {lowConfidence ? (
            <p className="mt-2 text-xs text-destructive">
              ความมั่นใจต่ำ กรุณาตรวจตัวเลขให้ละเอียดก่อนยืนยัน
            </p>
          ) : null}
        </div>

        <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">เลขครั้งก่อน</p>
              <p className="font-display text-xl font-bold">
                {draft.previous.toLocaleString("th-TH")}
              </p>
            </div>
            <div className="rounded-2xl bg-highlight p-3">
              <p className="text-xs text-highlight-foreground">หน่วยที่ใช้</p>
              <p className="font-display text-xl font-bold text-highlight-foreground">
                {valid && !tooLow ? diff.toLocaleString("th-TH") : "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="current" className="text-sm font-semibold">
              แก้ไขเลขปัจจุบันได้
            </Label>
            <Input
              id="current"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-14 rounded-2xl text-center font-display text-2xl"
            />
          </div>

          {tooLow ? (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              เลขปัจจุบันน้อยกว่าเลขครั้งก่อน กรุณาตรวจสอบอีกครั้ง
            </p>
          ) : suspicious ? (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-highlight p-3 text-xs text-highlight-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              หน่วยที่ใช้สูงกว่าปกติมาก ลองตรวจสอบตัวเลขอีกครั้ง
            </p>
          ) : valid ? (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-success-soft p-3 text-xs text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ตัวเลขอยู่ในช่วงที่สมเหตุสมผล
            </p>
          ) : null}
        </div>

        <SimulationNotice />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl"
            onClick={() => {
              setDraft(null);
              void navigate({ to: "/reading" });
            }}
          >
            ถ่ายใหม่
          </Button>
          <Button className="h-12 rounded-2xl" onClick={confirm}>
            ยืนยันเลขนี้
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
