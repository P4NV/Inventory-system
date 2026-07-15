import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @IsBoolean()
  @IsOptional()
  done?: boolean;
}
