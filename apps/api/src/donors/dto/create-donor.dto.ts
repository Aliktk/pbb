import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { BloodGroup, RhFactor, WillingFrequency, ModeOfIssue } from '@prisma/client';

export class CreateDonorDto {
  @IsString()
  @Length(1, 40)
  mrNo!: string;

  @IsString()
  @Length(1, 120)
  name!: string;

  @IsEnum(BloodGroup)
  bloodGroup!: BloodGroup;

  @IsEnum(RhFactor)
  rhFactor!: RhFactor;

  @IsISO8601()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  emergencyRelationship?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;

  /** Town the donor belongs to. A town-scoped user's own town is forced server-side. */
  @IsString()
  townId!: string;

  @IsString()
  branchId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityMl?: number;

  @IsOptional()
  @IsEnum(WillingFrequency)
  willingFrequency?: WillingFrequency;

  @IsOptional()
  @IsEnum(ModeOfIssue)
  modeOfIssue?: ModeOfIssue;

  @IsOptional()
  @IsBoolean()
  consentToCall?: boolean;
}
