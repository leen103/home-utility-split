import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplets, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { MonthSelect } from "@/components/metermate/MonthSelect";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { UploadField, type PickedFile } from "@/components/metermate/UploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { baht } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";
import type { Utility } from "@/lib/metermate/types";

export const Route = createFileRoute("/bill")({
  head: () => ({
    meta: [
      { title: "อัปโหลดบิลรวม — MeterMate" },
      {
        name: "description",
        content: "อัปโหลดรูปบิลค่าน้ำและค่าไฟใบรวมของทั้งบ้าน พร้อมกรอกยอดรวมในบิล",
      },
      { property: "og:title", content: "อัปโหลดบิลรวม — MeterMate" },
      { property: "og:description", content: "แนบรูปบิลค่าน้ำ/ค่าไฟใบเดียวของทั้งบ้าน" },
    ],
  }),
  component: BillUploadPage,
});

function BillUploadPage() {
  const { activeMonth } = useMeterMate();

  return (
    <AppShell title="บิลรวมของบ้าน" subtitle={activeMonth.label} showBack>
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
            <BillForm utility="electric" />
          </TabsContent>
          <TabsContent value="water" className="mt-4">
            <BillForm utility="water" />
          </TabsContent>
        </Tabs>
        <SampleNotice text="ยอดในบิลตัวอย่างเป็นข้อมูลสมมติ ระบบใช้ยอดนี้เพื่อเทียบกับผลคำนวณเท่านั้น" />
      </div>
    </AppShell>
  );
}

function BillForm({ utility }: { utility: Utility }) {
  const { activeMonth, saveBill, role } = useMeterMate();
  const navigate = useNavigate();
  const existing = activeMonth.bills[utility];
  const [file, setFile] = useState<PickedFile | null>(
    existing.dataUrl && existing.fileName
      ? { name: existing.fileName, dataUrl: existing.dataUrl }
      : null,
  );
  const [total, setTotal] = useState(existing.total ? String(existing.total) : "");

  const save = () => {
    const value = total === "" ? null : Number(total);
    if (value !== null && Number.isNaN(value)) {
      toast.error("ยอดรวมต้องเป็นตัวเลข");
      return;
    }
    saveBill(activeMonth.id, utility, {
      total: value,
      fileName: file?.name ?? existing.fileName,
      dataUrl: file?.dataUrl,
    });
    toast.success("บันทึกบิลรวมแล้ว");
    void navigate({ to: role === "owner" ? "/owner" : "/tenant" });
  };

  return (
    <div className="space-y-4 rounded-[20px] border border-border bg-card p-4 shadow-card">
      {existing.fileName && !file ? (
        <p className="truncate rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          ไฟล์ที่เคยส่ง: {existing.fileName}
        </p>
      ) : null}

      <UploadField
        label={`รูปบิล${utility === "water" ? "ค่าน้ำ" : "ค่าไฟ"}`}
        hint="ถ่ายรูปบิลที่ได้รับ หรือเลือกรูปจากเครื่อง"
        value={file}
        onChange={setFile}
      />

      <div className="space-y-2">
        <Label htmlFor={`total-${utility}`} className="text-sm font-semibold">
          ยอดรวมในบิล (บาท)
        </Label>
        <Input
          id={`total-${utility}`}
          inputMode="decimal"
          placeholder="เช่น 2489.50"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="h-14 rounded-2xl text-center font-display text-2xl"
        />
        {existing.total ? (
          <p className="text-xs text-muted-foreground">
            ยอดที่บันทึกไว้: ฿{baht(existing.total)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">ยังไม่มียอดบิลของเดือนนี้</p>
        )}
      </div>

      <Button className="h-12 w-full rounded-2xl text-base" onClick={save}>
        บันทึกบิลรวม
      </Button>
    </div>
  );
}
