import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsBoolean()
  @IsOptional()
  isInStock?: boolean;
}
