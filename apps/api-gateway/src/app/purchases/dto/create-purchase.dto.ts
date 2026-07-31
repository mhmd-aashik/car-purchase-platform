import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePurchaseDto {
  @IsUUID()
  carId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
