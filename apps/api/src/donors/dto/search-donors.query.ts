import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BloodGroup, RhFactor } from '@prisma/client';

/** The emergency donor search (backs the admin Find donors screen). */
export class SearchDonorsQuery {
  @IsEnum(BloodGroup)
  group!: BloodGroup;

  @IsEnum(RhFactor)
  rh!: RhFactor;

  @IsOptional()
  @IsString()
  townId?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeCooldown = false;
}
