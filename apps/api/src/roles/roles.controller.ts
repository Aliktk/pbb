import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RolesService, CreateRoleDto } from './roles.service';
import { Public } from '../rbac/decorators';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Public()
  @Get()
  list() {
    return this.rolesService.list();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.rolesService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
