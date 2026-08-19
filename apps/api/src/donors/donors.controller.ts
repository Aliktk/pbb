import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { ListDonorsQuery } from './dto/list-donors.query';
import { SearchDonorsQuery } from './dto/search-donors.query';
import { CreateDonorDto } from './dto/create-donor.dto';
import { Permissions, CurrentUser, Public } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donors: DonorsService) {}

  @Public()
  @Get()
  list(@CurrentUser() user: AuthUser | null, @Query() query: ListDonorsQuery) {
    return this.donors.list(user, query);
  }

  // Literal route declared before ':id' so "search" is never captured as an id.
  @Permissions('search:read')
  @Get('search')
  search(@CurrentUser() user: AuthUser, @Query() query: SearchDonorsQuery) {
    return this.donors.search(user, query);
  }

  @Permissions('donors:read')
  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.donors.getById(user, id);
  }

  @Public()
  @Post()
  create(@CurrentUser() user: AuthUser | null, @Body() dto: CreateDonorDto) {
    return this.donors.create(user, dto);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDonorDto>) {
    return this.donors.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donors.remove(id);
  }
}
