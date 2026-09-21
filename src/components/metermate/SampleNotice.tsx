import { Info } from "lucide-react";

export function SampleNotice({ text }: { text?: string }) {
  return (
    <div className="flex gap-2 rounded-[20px] border border-electric/30 bg-highlight px-3 py-3 text-[12px] leading-relaxed text-highlight-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {text ??
          "ข้อมูลตัวอย่างสำหรับทดลองใช้งาน อัตราค่าน้ำ/ค่าไฟจริงต้องตั้งค่าตามประกาศของหน่วยงานและรอบเดือนจริง"}
      </p>
    </div>
  );
}

export function SimulationNotice({ text }: { text?: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-card px-3 py-2 text-[12px] text-muted-foreground">
      {text ?? "การอ่านตัวเลขจากรูปเป็นการจำลอง (ยังไม่ได้เชื่อมต่อระบบ OCR จริง)"}
    </div>
  );
}
