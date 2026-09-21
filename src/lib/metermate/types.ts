export type Utility = "water" | "electric";
export type MeterKind = "main" | "sub";
export type Role = "owner" | "tenant";

export type PaymentStatus =
  | "awaiting_data"
  | "awaiting_payment"
  | "awaiting_review"
  | "paid";

export interface Reading {
  previous: number;
  current: number;
  source: "manual" | "ocr";
  confidence?: number;
  photoName?: string;
  photoDataUrl?: string;
  updatedAt: string;
}

export interface BillUpload {
  total: number | null;
  fileName?: string;
  dataUrl?: string;
  uploadedAt?: string;
}

export interface MonthData {
  id: string;
  label: string;
  readings: Record<Utility, Record<MeterKind, Reading | null>>;
  bills: Record<Utility, BillUpload>;
  payment: {
    status: PaymentStatus;
    paidAt?: string;
    note?: string;
    slipName?: string;
    slipDataUrl?: string;
    verifiedAt?: string;
  };
}

export interface Tier {
  upTo: number | null;
  rate: number;
}

export interface UtilityRates {
  tiers: Tier[];
  ft: number;
  service: number;
  vat: number;
  effectiveFrom: string;
}

export type Rates = Record<Utility, UtilityRates>;

export interface SideBreakdown {
  units: number;
  usage: number;
  ft: number;
  service: number;
  subtotal: number;
  vat: number;
  total: number;
}

export interface UtilityAllocation {
  mainUnits: number;
  subUnits: number;
  ownerUnits: number;
  tenantUnits: number;
  owner: SideBreakdown;
  tenant: SideBreakdown;
  combined: number;
  billTotal: number | null;
  ready: boolean;
}

export interface DraftReading {
  utility: Utility;
  kind: MeterKind;
  monthId: string;
  previous: number;
  current: number | null;
  confidence?: number;
  source: "manual" | "ocr";
  photoName?: string;
  photoDataUrl?: string;
}
