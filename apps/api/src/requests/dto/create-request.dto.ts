import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BloodGroup, RhFactor, RequestUrgency } from '@prisma/client';

/**
 * Public blood-request intake (the website "Request blood" form). Patient name is optional and
 * is never echoed to the public. requesterPhone is how the branch calls back.
 */
export class CreateRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  patientName?: string;

  @IsString()
  @Length(1, 160)
  hospital!: string;

  @IsString()
  townId!: string;

  @IsEnum(BloodGroup)
  bloodGroup!: BloodGroup;

  @IsEnum(RhFactor)
  rhFactor!: RhFactor;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  unitsNeeded = 1;

  @IsOptional()
  @IsEnum(RequestUrgency)
  urgency?: RequestUrgency;

  @IsString()
  @Length(1, 120)
  requesterName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  requesterRelationship?: string;

  @IsString()
  @Length(7, 30)
  requesterPhone!: string;

  @IsOptional()
  @IsBoolean()
  transportAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  exchangePossible?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caseNotes?: string;
}
