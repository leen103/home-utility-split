import { unitsOf } from "./calc";
import type { MeterKind, MonthData, Utility } from "./types";

export type IssueLevel = "error" | "warn" | "ok";

export interface MeterIssue {
  id: string;
  level: IssueLevel;
  utility: Utility;
  kind?: MeterKind | undefined;
  message: string;
  detail?: string | undefined;
}

const utilityLabel: Record<Utility, string> = {
  water: "น้ำ",
  electric: "ไฟ",
};

const kindLabel: Record<MeterKind, string> = {
  main: "มิเตอร์หลัก",
  sub: "มิเตอร์ย่อย",
};

/** ค่าเฉลี่ยหน่วยของมิเตอร์หลักจากเดือนก่อนหน้า (ใช้ตรวจความผิดปกติ) */
function averageMainUnits(history: MonthData[], utility: Utility): number | null {
  const values = history
    .map((m) => unitsOf(m, utility, "main"))
    .filter((v): v is number => v !== null && v > 0);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function checkMonth(month: MonthData, history: MonthData[] = []): MeterIssue[] {
  const issues: MeterIssue[] = [];
  const others = history.filter((m) => m.id !== month.id);

  (["water", "electric"] as Utility[]).forEach((utility) => {
    const u = utilityLabel[utility];

    (["main", "sub"] as MeterKind[]).forEach((kind) => {
      const r = month.readings[utility][kind];
      if (!r) {
        issues.push({
          id: `${utility}-${kind}-missing`,
          level: "error",
          utility,
          kind,
          message: `ยังไม่มีเลข${kindLabel[kind]}${u}`,
          detail: "ต้องบันทึกเลขให้ครบก่อนจึงจะคำนวณยอดได้ถูกต้อง",
        });
        return;
      }
      if (r.current < r.previous) {
        issues.push({
          id: `${utility}-${kind}-backward`,
          level: "error",
          utility,
          kind,
          message: `เลข${kindLabel[kind]}${u}น้อยกว่าครั้งก่อน`,
          detail: `ครั้งก่อน ${r.previous.toLocaleString("th-TH")} · ปัจจุบัน ${r.current.toLocaleString("th-TH")}`,
        });
      }
      if (r.current === r.previous) {
        issues.push({
          id: `${utility}-${kind}-zero`,
          level: "warn",
          utility,
          kind,
          message: `${kindLabel[kind]}${u}ไม่มีการใช้งานเลย`,
          detail: "ตรวจดูว่าอ่านเลขถูกต้องหรือมิเตอร์ค้างหรือไม่",
        });
      }
      if (r.source === "ocr" && typeof r.confidence === "number" && r.confidence < 0.85) {
        issues.push({
          id: `${utility}-${kind}-confidence`,
          level: "warn",
          utility,
          kind,
          message: `ผลอ่านรูป${kindLabel[kind]}${u}มีความมั่นใจต่ำ`,
          detail: `ความมั่นใจ ${Math.round(r.confidence * 100)}% ควรดูรูปเทียบอีกครั้ง`,
        });
      }
    });

    const main = unitsOf(month, utility, "main");
    const sub = unitsOf(month, utility, "sub");

    if (main !== null && sub !== null && sub > main) {
      issues.push({
        id: `${utility}-sub-over-main`,
        level: "error",
        utility,
        message: `หน่วยมิเตอร์ย่อย${u}มากกว่ามิเตอร์หลัก`,
        detail: `หลัก ${main.toLocaleString("th-TH")} · ย่อย ${sub.toLocaleString("th-TH")} ทำให้ส่วนของผู้เช่าติดลบ`,
      });
    }

    if (main !== null) {
      const avg = averageMainUnits(others, utility);
      if (avg && main > avg * 1.8) {
        issues.push({
          id: `${utility}-spike`,
          level: "warn",
          utility,
          message: `หน่วย${u}เดือนนี้สูงผิดปกติ`,
          detail: `เดือนนี้ ${Math.round(main).toLocaleString("th-TH")} หน่วย เทียบค่าเฉลี่ย ${Math.round(avg).toLocaleString("th-TH")} หน่วย`,
        });
      }
      if (avg && main > 0 && main < avg * 0.4) {
        issues.push({
          id: `${utility}-drop`,
          level: "warn",
          utility,
          message: `หน่วย${u}เดือนนี้ต่ำผิดปกติ`,
          detail: `เดือนนี้ ${Math.round(main).toLocaleString("th-TH")} หน่วย เทียบค่าเฉลี่ย ${Math.round(avg).toLocaleString("th-TH")} หน่วย`,
        });
      }
    }

    if (month.bills[utility].total === null) {
      issues.push({
        id: `${utility}-bill-missing`,
        level: "warn",
        utility,
        message: `ยังไม่ได้บันทึกยอดบิล${u}รวม`,
        detail: "ใช้เทียบกับยอดที่ระบบคำนวณได้",
      });
    }
  });

  return issues;
}

export function worstLevel(issues: MeterIssue[]): IssueLevel {
  if (issues.some((i) => i.level === "error")) return "error";
  if (issues.some((i) => i.level === "warn")) return "warn";
  return "ok";
}
