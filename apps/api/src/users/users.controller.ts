import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService, CreateUserDto } from './users.service';
import { Public, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  list() {
    return this.usersService.list();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user?: AuthUser) {
    return this.usersService.create(dto, user?.id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
    return this.usersService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
