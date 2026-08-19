import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DonationsService, RecordDonationDto } from './donations.service';
import { Public, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Public()
  @Get()
  list(@Query('donorId') donorId?: string) {
    return this.donationsService.list(donorId);
  }

  @Public()
  @Post()
  record(@CurrentUser() user: AuthUser | null, @Body() dto: RecordDonationDto) {
    return this.donationsService.record(dto, user?.id);
  }
}
