import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BloodGroup, RhFactor } from '@prisma/client';

export class ListDonorsQuery {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(BloodGroup)
  group?: BloodGroup;

  @IsOptional()
  @IsEnum(RhFactor)
  rh?: RhFactor;

  @IsOptional()
  @IsString()
  townId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  pageSize = 25;
}
