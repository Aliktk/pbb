import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { AuditService, CreateAuditDto } from './audit.service';
import { Public, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Public()
  @Get()
  list(@Query('search') search?: string, @Query('month') month?: string) {
    return this.auditService.list({ search, month });
  }

  @Public()
  @Post()
  create(@Body() dto: CreateAuditDto, @CurrentUser() user?: AuthUser) {
    return this.auditService.logAction(dto, user);
  }

  @Public()
  @Delete()
  purgeAll() {
    return this.auditService.purgeAll();
  }
}
