import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gauge,
  History,
  Home,
  Settings,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMeterMate } from "@/lib/metermate/store";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home };

const tenantNav: NavItem[] = [
  { to: "/tenant", label: "หน้าหลัก", icon: Home },
  { to: "/reading", label: "บันทึกเลข", icon: Gauge },
  { to: "/bill", label: "บิลรวม", icon: FileText },
  { to: "/tenant/payment", label: "ชำระเงิน", icon: Wallet },
  { to: "/history", label: "ประวัติ", icon: History },
];

const ownerNav: NavItem[] = [
  { to: "/owner", label: "หน้าหลัก", icon: Home },
  { to: "/reading", label: "บันทึกเลข", icon: Gauge },
  { to: "/owner/verify", label: "ตรวจสอบ", icon: CheckCircle2 },
  { to: "/history", label: "ประวัติ", icon: History },
  { to: "/owner/rates", label: "อัตรา", icon: Settings },
];

export function AppShell({
  title,
  subtitle,
  children,
  showBack = false,
  hideNav = false,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  hideNav?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  const { role } = useMeterMate();
  const nav = role === "owner" ? ownerNav : tenantNav;

  return (
    <div className="min-h-screen w-full bg-muted/40 py-0 sm:py-8">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden bg-background shadow-card sm:rounded-[28px] sm:border sm:border-border">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            {showBack ? (
              <button
                aria-label="ย้อนกลับ"
                onClick={() => router.history.back()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-card text-foreground active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground">
                M
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-semibold leading-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="shrink-0">{action}</div>
          </div>
        </header>

        <main className={cn("px-4 pt-4", hideNav ? "pb-8" : "pb-28")}>{children}</main>

        {!hideNav && role ? (
          <nav className="sticky bottom-0 z-20 border-t border-border bg-background/95 px-1 py-1 backdrop-blur">
            <ul className="grid grid-cols-5">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] text-muted-foreground transition-colors data-[status=active]:bg-primary/10 data-[status=active]:font-semibold data-[status=active]:text-primary"
                      activeOptions={{ exact: true }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
