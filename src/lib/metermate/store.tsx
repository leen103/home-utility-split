import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_MONTH_ID, SAMPLE_MONTHS, SAMPLE_RATES } from "./sample-data";
import type {
  DraftReading,
  MeterKind,
  MonthData,
  Rates,
  Role,
  Utility,
} from "./types";

const STORAGE_KEY = "metermate:v1";

interface Persisted {
  role: Role | null;
  months: MonthData[];
  rates: Rates;
  activeMonthId: string;
}

interface StoreValue extends Persisted {
  hydrated: boolean;
  activeMonth: MonthData;
  setRole: (r: Role | null) => void;
  setActiveMonthId: (id: string) => void;
  saveReading: (
    monthId: string,
    utility: Utility,
    kind: MeterKind,
    reading: {
      previous: number;
      current: number;
      source: "manual" | "ocr";
      confidence?: number | undefined;
      photoName?: string | undefined;
      photoDataUrl?: string | undefined;
    },
  ) => void;
  saveBill: (
    monthId: string,
    utility: Utility,
    bill: { total: number | null; fileName?: string | undefined; dataUrl?: string | undefined },
  ) => void;
  markPaid: (monthId: string, paidAt: string, note?: string) => void;
  submitSlip: (
    monthId: string,
    slipName: string,
    slipDataUrl?: string,
    note?: string,
  ) => void;
  verifyPayment: (monthId: string) => void;
  rejectPayment: (monthId: string) => void;
  updateRates: (rates: Rates) => void;
  resetAll: () => void;
  draft: DraftReading | null;
  setDraft: (d: DraftReading | null) => void;
}

const defaults = (): Persisted => ({
  role: null,
  months: JSON.parse(JSON.stringify(SAMPLE_MONTHS)) as MonthData[],
  rates: JSON.parse(JSON.stringify(SAMPLE_RATES)) as Rates,
  activeMonthId: CURRENT_MONTH_ID,
});

const StoreContext = createContext<StoreValue | null>(null);

export function MeterMateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<DraftReading | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, hydrated]);

  const patchMonth = useCallback(
    (monthId: string, fn: (m: MonthData) => MonthData) => {
      setState((prev) => ({
        ...prev,
        months: prev.months.map((m) => (m.id === monthId ? fn(m) : m)),
      }));
    },
    [],
  );

  const value = useMemo<StoreValue>(() => {
    const activeMonth =
      state.months.find((m) => m.id === state.activeMonthId) ?? state.months[0]!;

    return {
      ...state,
      hydrated,
      activeMonth,
      draft,
      setDraft,
      setRole: (role) => setState((p) => ({ ...p, role })),
      setActiveMonthId: (activeMonthId) => setState((p) => ({ ...p, activeMonthId })),
      saveReading: (monthId, utility, kind, reading) =>
        patchMonth(monthId, (m) => {
          const next: MonthData = {
            ...m,
            readings: {
              ...m.readings,
              [utility]: {
                ...m.readings[utility],
                [kind]: { ...reading, updatedAt: new Date().toISOString() },
              },
            },
          };
          const complete =
            next.readings.water.main &&
            next.readings.water.sub &&
            next.readings.electric.main &&
            next.readings.electric.sub;
          if (complete && next.payment.status === "awaiting_data") {
            next.payment = { ...next.payment, status: "awaiting_payment" };
          }
          return next;
        }),
      saveBill: (monthId, utility, bill) =>
        patchMonth(monthId, (m) => ({
          ...m,
          bills: {
            ...m.bills,
            [utility]: { ...bill, uploadedAt: new Date().toISOString() },
          },
        })),
      markPaid: (monthId, paidAt, note) =>
        patchMonth(monthId, (m) => ({
          ...m,
          payment: { ...m.payment, status: "awaiting_review", paidAt, note },
        })),
      submitSlip: (monthId, slipName, slipDataUrl, note) =>
        patchMonth(monthId, (m) => ({
          ...m,
          payment: {
            ...m.payment,
            status: "awaiting_review",
            paidAt: m.payment.paidAt ?? new Date().toISOString().slice(0, 10),
            slipName,
            slipDataUrl,
            note: note ?? m.payment.note,
          },
        })),
      verifyPayment: (monthId) =>
        patchMonth(monthId, (m) => ({
          ...m,
          payment: {
            ...m.payment,
            status: "paid",
            verifiedAt: new Date().toISOString().slice(0, 10),
          },
        })),
      rejectPayment: (monthId) =>
        patchMonth(monthId, (m) => ({
          ...m,
          payment: { ...m.payment, status: "awaiting_payment", verifiedAt: undefined },
        })),
      updateRates: (rates) => setState((p) => ({ ...p, rates })),
      resetAll: () => {
        const d = defaults();
        setState({ ...d, role: state.role });
      },
    };
  }, [state, hydrated, draft, patchMonth]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useMeterMate() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useMeterMate must be used inside MeterMateProvider");
  return ctx;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}
