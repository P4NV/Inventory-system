import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  password: string;
}