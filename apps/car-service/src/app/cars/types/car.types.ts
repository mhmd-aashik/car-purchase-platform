export const CAR_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
} as const;

export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  status: CarStatus;
  createdAt: string;
  updatedAt: string;
}
