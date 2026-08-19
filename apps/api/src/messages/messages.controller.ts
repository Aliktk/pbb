import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MessagesService, CreateMessageDto } from './messages.service';
import { Permissions, Public, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';
import { MessageStatus } from '@prisma/client';

export class UpdateMessageStatusDto {
  status: MessageStatus;
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Public()
  @Get()
  list(@Query('status') status?: MessageStatus) {
    return this.messagesService.list(status);
  }

  @Public()
  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  @Public()
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: UpdateMessageStatusDto,
  ) {
    return this.messagesService.updateStatus(id, dto.status, user?.id);
  }
}
