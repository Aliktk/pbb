import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Permissions, CurrentUser, Public } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';
import { BloodGroup, RhFactor } from '@prisma/client';

export class UpdateStockBodyDto {
  branchId: string;
  bloodGroup: BloodGroup;
  rhFactor: RhFactor;
  unitsAvailable: number;
}

@Controller('stock')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Public()
  @Get()
  list(@Query('branchId') branchId?: string) {
    return this.inventoryService.listStock(branchId);
  }

  @Public()
  @Patch('bulk')
  bulkUpdate(
    @CurrentUser() user: AuthUser | null,
    @Body() body: { branchId: string; items: Array<{ bloodGroup: BloodGroup; rhFactor: RhFactor; unitsAvailable: number }> },
  ) {
    return this.inventoryService.bulkUpdateStock(body.branchId, body.items, user?.id);
  }

  @Permissions('inventory:write')
  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateStockBodyDto) {
    return this.inventoryService.updateStock(dto, user.id);
  }
}
