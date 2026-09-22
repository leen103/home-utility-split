import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { checkMonth, worstLevel, type MeterIssue } from "@/lib/metermate/validate";
import type { MonthData } from "@/lib/metermate/types";
import { cn } from "@/lib/utils";

const levelStyle = {
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  warn: "border-warning/40 bg-highlight text-highlight-foreground",
  ok: "border-success/40 bg-success-soft text-success",
} as const;

function Icon({ level }: { level: MeterIssue["level"] }) {
  if (level === "error") return <XCircle className="mt-0.5 h-4 w-4 shrink-0" />;
  if (level === "warn") return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />;
  return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />;
}

export function MeterCheckCard({
  month,
  history = [],
  title = "ตรวจข้อมูลมิเตอร์",
}: {
  month: MonthData;
  history?: MonthData[];
  title?: string;
}) {
  const issues = checkMonth(month, history);
  const level = worstLevel(issues);
  const errors = issues.filter((i) => i.level === "error").length;
  const warns = issues.filter((i) => i.level === "warn").length;

  return (
    <section className="space-y-3 rounded-[20px] border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{month.label}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
            levelStyle[level],
          )}
        >
          <Icon level={level} />
          {level === "ok"
            ? "ข้อมูลครบถ้วน"
            : level === "error"
              ? `ต้องแก้ไข ${errors} จุด`
              : `ควรตรวจ ${warns} จุด`}
        </span>
      </div>

      {issues.length === 0 ? (
        <p className="rounded-[16px] border border-success/40 bg-success-soft px-3 py-3 text-[12px] text-success">
          ตรวจแล้ว: เลขมิเตอร์น้ำและไฟครบทั้งหลักและย่อย ค่าที่ได้อยู่ในช่วงปกติ
        </p>
      ) : (
        <ul className="space-y-2">
          {issues.map((i) => (
            <li
              key={i.id}
              className={cn(
                "flex gap-2 rounded-[16px] border px-3 py-2 text-[12px] leading-relaxed",
                levelStyle[i.level],
              )}
            >
              <Icon level={i.level} />
              <span className="min-w-0">
                <span className="block font-semibold">{i.message}</span>
                {i.detail ? <span className="block opacity-90">{i.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
