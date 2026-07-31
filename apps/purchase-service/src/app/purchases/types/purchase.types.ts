export const PURCHASE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type PurchaseStatus =
  (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS];

export interface Purchase {
  id: string;
  carId: string;
  userId: string;
  carBrand: string;
  carModel: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CarResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  createdAt: string;
  updatedAt: string;
}

export interface FindPurchasePayload {
  id: string;
}

export interface FindUserPurchasesPayload {
  userId: string;
}
