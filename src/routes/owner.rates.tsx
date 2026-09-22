import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_RATES } from "@/lib/metermate/sample-data";
import { useMeterMate } from "@/lib/metermate/store";
import type { Rates, Utility } from "@/lib/metermate/types";

export const Route = createFileRoute("/owner/rates")({
  head: () => ({
    meta: [
      { title: "ตั้งค่าอัตรา (ตัวอย่าง) — MeterMate" },
      {
        name: "description",
        content: "ตั้งค่าอัตราขั้นบันได ค่า Ft ค่าบริการ VAT และวันที่มีผล เป็นข้อมูลตัวอย่าง",
      },
      { property: "og:title", content: "ตั้งค่าอัตรา (ตัวอย่าง) — MeterMate" },
      { property: "og:description", content: "อัตราขั้นบันได Ft ค่าบริการ และ VAT" },
    ],
  }),
  component: RateSettings,
});

const utilityLabel: Record<Utility, string> = { water: "น้ำ", electric: "ไฟ" };

function RateSettings() {
  const { rates, updateRates } = useMeterMate();
  const [draft, setDraft] = useState<Rates>(() => JSON.parse(JSON.stringify(rates)) as Rates);

  const patch = (u: Utility, fn: (r: Rates[Utility]) => Rates[Utility]) =>
    setDraft((p) => ({ ...p, [u]: fn(p[u]) }));

  const save = () => {
    const bad = (["water", "electric"] as Utility[]).some((u) =>
      draft[u].tiers.some((t) => !Number.isFinite(t.rate) || t.rate <= 0),
    );
    if (bad) {
      toast.error("อัตราต่อหน่วยต้องเป็นตัวเลขมากกว่า 0");
      return;
    }
    updateRates(draft);
    toast.success("บันทึกอัตราตัวอย่างแล้ว");
  };

  return (
    <AppShell title="ตั้งค่าอัตรา" subtitle="ข้อมูลตัวอย่างสำหรับทดลองใช้งาน">
      <div className="space-y-4">
        <Tabs defaultValue="electric">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl">
            <TabsTrigger value="electric" className="rounded-xl">
              ค่าไฟ
            </TabsTrigger>
            <TabsTrigger value="water" className="rounded-xl">
              ค่าน้ำ
            </TabsTrigger>
          </TabsList>

          {(["electric", "water"] as Utility[]).map((u) => (
            <TabsContent key={u} value={u} className="mt-4 space-y-4">
              <section className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
                <p className="text-sm font-semibold">อัตราขั้นบันได ({utilityLabel[u]})</p>
                {draft[u].tiers.map((t, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        ถึงหน่วยที่ {t.upTo === null ? "(ไม่จำกัด)" : ""}
                      </Label>
                      <Input
                        inputMode="numeric"
                        disabled={t.upTo === null}
                        value={t.upTo === null ? "ไม่จำกัด" : String(t.upTo)}
                        onChange={(e) =>
                          patch(u, (r) => ({
                            ...r,
                            tiers: r.tiers.map((x, j) =>
                              j === i ? { ...x, upTo: Number(e.target.value) || 0 } : x,
                            ),
                          }))
                        }
                        className="mt-1 h-12 rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">บาท/หน่วย</Label>
                      <Input
                        inputMode="decimal"
                        value={String(t.rate)}
                        onChange={(e) =>
                          patch(u, (r) => ({
                            ...r,
                            tiers: r.tiers.map((x, j) =>
                              j === i ? { ...x, rate: Number(e.target.value) } : x,
                            ),
                          }))
                        }
                        className="mt-1 h-12 rounded-2xl"
                      />
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-2 gap-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
                <div>
                  <Label className="text-xs text-muted-foreground">ค่า Ft (บาท/หน่วย)</Label>
                  <Input
                    inputMode="decimal"
                    value={String(draft[u].ft)}
                    onChange={(e) =>
                      patch(u, (r) => ({ ...r, ft: Number(e.target.value) }))
                    }
                    className="mt-1 h-12 rounded-2xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ค่าบริการ (บาท)</Label>
                  <Input
                    inputMode="decimal"
                    value={String(draft[u].service)}
                    onChange={(e) =>
                      patch(u, (r) => ({ ...r, service: Number(e.target.value) }))
                    }
                    className="mt-1 h-12 rounded-2xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">VAT (%)</Label>
                  <Input
                    inputMode="decimal"
                    value={String(Math.round(draft[u].vat * 10000) / 100)}
                    onChange={(e) =>
                      patch(u, (r) => ({ ...r, vat: Number(e.target.value) / 100 }))
                    }
                    className="mt-1 h-12 rounded-2xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">วันที่มีผล</Label>
                  <Input
                    value={draft[u].effectiveFrom}
                    onChange={(e) =>
                      patch(u, (r) => ({ ...r, effectiveFrom: e.target.value }))
                    }
                    className="mt-1 h-12 rounded-2xl"
                  />
                </div>
                <p className="col-span-2 text-[11px] text-muted-foreground">
                  ค่าบริการจะถูกหารสองระหว่างเจ้าของและผู้เช่า ส่วน VAT คิดหลังรวมค่าใช้หน่วย + Ft +
                  ส่วนแบ่งค่าบริการของแต่ละฝ่าย
                </p>
              </section>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl text-base"
            onClick={() => {
              setDraft(JSON.parse(JSON.stringify(SAMPLE_RATES)) as Rates);
              toast("คืนค่าอัตราตัวอย่างเริ่มต้นแล้ว (ยังไม่บันทึก)");
            }}
          >
            <RotateCcw className="mr-1 h-5 w-5" /> ค่าเริ่มต้น
          </Button>
          <Button className="h-12 rounded-2xl text-base" onClick={save}>
            บันทึกอัตรา
          </Button>
        </div>

        <SampleNotice text="อัตราทั้งหมดนี้เป็นข้อมูลตัวอย่างเพื่อทดลองคำนวณ ไม่ใช่อัตราทางการ ต้องตั้งค่าตามประกาศของการไฟฟ้า/การประปาและรอบเดือนจริง" />
      </div>
    </AppShell>
  );
}
