import type {
  MonthData,
  Rates,
  SideBreakdown,
  Tier,
  Utility,
  UtilityAllocation,
} from "./types";

export function tieredCost(units: number, tiers: Tier[]): number {
  let remaining = Math.max(0, units);
  let used = 0;
  let cost = 0;
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const cap = tier.upTo === null ? Infinity : tier.upTo - used;
    const take = Math.min(remaining, cap);
    cost += take * tier.rate;
    remaining -= take;
    used += take;
  }
  return cost;
}

export function sideBreakdown(
  units: number,
  rates: { tiers: Tier[]; ft: number; service: number; vat: number },
): SideBreakdown {
  const usage = tieredCost(units, rates.tiers);
  const ft = units * rates.ft;
  const service = rates.service / 2;
  const subtotal = usage + ft + service;
  const vat = subtotal * rates.vat;
  return { units, usage, ft, service, subtotal, vat, total: subtotal + vat };
}

export function unitsOf(
  month: MonthData,
  utility: Utility,
  kind: "main" | "sub",
): number | null {
  const r = month.readings[utility][kind];
  if (!r) return null;
  return Math.max(0, r.current - r.previous);
}

export function allocate(
  month: MonthData,
  utility: Utility,
  rates: Rates,
): UtilityAllocation {
  const mainUnits = unitsOf(month, utility, "main");
  const subUnits = unitsOf(month, utility, "sub");
  const ready = mainUnits !== null && subUnits !== null;
  const main = mainUnits ?? 0;
  const sub = Math.min(subUnits ?? 0, main);
  const tenantUnits = Math.max(0, main - sub);
  const r = rates[utility];
  const owner = sideBreakdown(sub, r);
  const tenant = sideBreakdown(tenantUnits, r);
  return {
    mainUnits: main,
    subUnits: sub,
    ownerUnits: sub,
    tenantUnits,
    owner,
    tenant,
    combined: owner.total + tenant.total,
    billTotal: month.bills[utility].total,
    ready,
  };
}

export function monthTotals(month: MonthData, rates: Rates) {
  const water = allocate(month, "water", rates);
  const electric = allocate(month, "electric", rates);
  return {
    water,
    electric,
    ownerTotal: water.owner.total + electric.owner.total,
    tenantTotal: water.tenant.total + electric.tenant.total,
    grandTotal: water.combined + electric.combined,
    ready: water.ready && electric.ready,
  };
}

export const baht = (n: number) =>
  n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const unitText = (n: number, utility: Utility) =>
  `${n.toLocaleString("th-TH")} ${utility === "water" ? "หน่วย (ลบ.ม.)" : "หน่วย (kWh)"}`;
