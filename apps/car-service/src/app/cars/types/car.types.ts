import { UpdateCarDto } from '../dto/update-car.dto';

export const CAR_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
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

export interface FindCarPayload {
  id: string;
}

export interface UpdateCarPayload {
  id: string;
  data: UpdateCarDto;
}

export interface RemoveCarPayload {
  id: string;
}
