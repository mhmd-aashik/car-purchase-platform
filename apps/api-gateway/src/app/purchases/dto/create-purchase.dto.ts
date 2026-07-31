import { IsUUID } from 'class-validator';

export class CreatePurchaseDto {
  @IsUUID()
  carId!: string;
}
