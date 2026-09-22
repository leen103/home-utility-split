import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/metermate/AppShell";
import { MeterCheckCard } from "@/components/metermate/MeterCheckCard";
import { SampleNotice } from "@/components/metermate/SampleNotice";
import { StatusBadge } from "@/components/metermate/StatusBadge";
import { UploadField, type PickedFile } from "@/components/metermate/UploadField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { baht, monthTotals } from "@/lib/metermate/calc";
import { useMeterMate } from "@/lib/metermate/store";
import { checkMonth } from "@/lib/metermate/validate";

export const Route = createFileRoute("/tenant/payment")({
  head: () => ({
    meta: [
      { title: "แจ้งชำระเงิน — MeterMate" },
      {
        name: "description",
        content: "ติ๊กว่าจ่ายแล้วพร้อมวันที่และหมายเหตุ หรืออัปโหลดสลิปให้เจ้าของตรวจสอบ",
      },
      { property: "og:title", content: "แจ้งชำระเงิน — MeterMate" },
      { property: "og:description", content: "แจ้งชำระค่าน้ำค่าไฟและดูสถานะการตรวจสอบ" },
    ],
  }),
  component: TenantPayment;
});

function TenantPayment() {
  const { activeMonth, months, markPaid, submitSlip } = useMeterMate();
  const totals = monthTotals(activeMonth, rates0());
  return null;
}

function rates0() {
  throw new Error("unused");
}
