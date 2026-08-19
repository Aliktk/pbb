import { Body, Controller, Get, Post } from '@nestjs/common';
import { BranchesService, CreateBranchDto } from './branches.service';
import { Permissions, Public } from '../rbac/decorators';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Public()
  @Get()
  list() {
    return this.branchesService.list();
  }

  @Permissions('accounts:write')
  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }
}
