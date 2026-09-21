import type { MonthData, Rates } from "./types";

export const SAMPLE_RATES: Rates = {
  electric: {
    tiers: [
      { upTo: 150, rate: 3.2484 },
      { upTo: 400, rate: 4.2218 },
      { upTo: null, rate: 4.4217 },
    ],
    ft: 0.3672,
    service: 38.22,
    vat: 0.07,
    effectiveFrom: "1 ก.ย. 2569",
  },
  water: {
    tiers: [
      { upTo: 30, rate: 10.2 },
      { upTo: 50, rate: 16.0 },
      { upTo: null, rate: 17.34 },
    ],
    ft: 0.15,
    service: 30.0,
    vat: 0.07,
    effectiveFrom: "1 ก.ย. 2569",
  },
};

const mk = (
  id: string,
  label: string,
  e: [number, number, number, number],
  w: [number, number, number, number],
  bills: { water: number | null; electric: number | null },
  payment: MonthData["payment"],
): MonthData => ({
  id,
  label,
  readings: {
    electric: {
      main: {
        previous: e[0],
        current: e[1],
        source: "ocr",
        confidence: 0.94,
        photoName: `main-electric-${id}.jpg`,
        updatedAt: `${id}-28`,
      },
      sub: {
        previous: e[2],
        current: e[3],
        source: "manual",
        updatedAt: `${id}-28`,
      },
    },
    water: {
      main: {
        previous: w[0],
        current: w[1],
        source: "ocr",
        confidence: 0.91,
        photoName: `main-water-${id}.jpg`,
        updatedAt: `${id}-28`,
      },
      sub: {
        previous: w[2],
        current: w[3],
        source: "manual",
        updatedAt: `${id}-28`,
      },
    },
  },
  bills: {
    water: {
      total: bills.water,
      fileName: bills.water ? `bill-water-${id}.jpg` : undefined,
      uploadedAt: bills.water ? `${id}-29` : undefined,
    },
    electric: {
      total: bills.electric,
      fileName: bills.electric ? `bill-electric-${id}.jpg` : undefined,
      uploadedAt: bills.electric ? `${id}-29` : undefined,
    },
  },
  payment,
});

export const SAMPLE_MONTHS: MonthData[] = [
  mk(
    "2569-09",
    "กันยายน 2569",
    [12450, 12980, 3200, 3390],
    [845, 872, 210, 219],
    { water: 705.4, electric: 2489.5 },
    { status: "awaiting_payment" },
  ),
  mk(
    "2569-08",
    "สิงหาคม 2569",
    [11930, 12450, 3010, 3200],
    [818, 845, 192, 210],
    { water: 690.2, electric: 2441.0 },
    {
      status: "paid",
      paidAt: "2569-09-03",
      note: "โอนผ่านแอปธนาคาร",
      slipName: "slip-2569-08.jpg",
      verifiedAt: "2569-09-04",
    },
  ),
  mk(
    "2569-07",
    "กรกฎาคม 2569",
    [11400, 11930, 2830, 3010],
    [790, 818, 175, 192],
    { water: 682.0, electric: 2455.8 },
    {
      status: "paid",
      paidAt: "2569-08-02",
      note: "จ่ายเงินสดที่บ้าน",
      verifiedAt: "2569-08-02",
    },
  ),
  mk(
    "2569-06",
    "มิถุนายน 2569",
    [10880, 11400, 2660, 2830],
    [764, 790, 160, 175],
    { water: 668.5, electric: 2402.3 },
    {
      status: "paid",
      paidAt: "2569-07-04",
      slipName: "slip-2569-06.jpg",
      verifiedAt: "2569-07-05",
    },
  ),
];

export const CURRENT_MONTH_ID = "2569-09";
