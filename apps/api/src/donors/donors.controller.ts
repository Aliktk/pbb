import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { ListDonorsQuery } from './dto/list-donors.query';
import { SearchDonorsQuery } from './dto/search-donors.query';
import { CreateDonorDto } from './dto/create-donor.dto';
import { Permissions, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('donors')
export class DonorsController {
  constructor(private readonly donors: DonorsService) {}

  @Permissions('donors:read')
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListDonorsQuery) {
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

  @Permissions('donors:write')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDonorDto) {
    return this.donors.create(user, dto);
  }
}
