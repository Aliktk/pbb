import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQuery } from './dto/list-requests.query';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { Public, Permissions, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  // Public: the website "Request blood" form. Throttled so the open intake cannot be flooded.
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @Public()
  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requests.createPublic(dto);
  }

  // Public: the "who needs blood now" board - privacy-stripped. Declared before ':id'.
  @Public()
  @Get('public')
  listPublic() {
    return this.requests.listPublic();
  }

  @Permissions('requests:read')
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListRequestsQuery) {
    return this.requests.listAdmin(user, query);
  }

  @Permissions('requests:read')
  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.getAdmin(user, id);
  }

  @Permissions('requests:write')
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requests.updateStatus(user, id, dto);
  }
}
