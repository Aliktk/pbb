import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageDirection, MessageChannel, MessageStatus } from '@prisma/client';

export interface CreateMessageDto {
  fromName?: string;
  fromPhone?: string;
  subject?: string;
  body: string;
  townId?: string;
  requestId?: string;
}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(status?: MessageStatus) {
    const where = status ? { status } : {};
    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data: messages, meta: { total: messages.length } };
  }

  async create(dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        direction: MessageDirection.INBOUND,
        channel: MessageChannel.WEB_FORM,
        status: MessageStatus.UNREAD,
        fromName: dto.fromName || null,
        fromPhone: dto.fromPhone || null,
        subject: dto.subject || null,
        body: dto.body,
        townId: dto.townId || null,
        requestId: dto.requestId || null,
      },
    });
  }

  async updateStatus(id: string, status: MessageStatus, handledById?: string) {
    const msg = await this.prisma.message.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');

    return this.prisma.message.update({
      where: { id },
      data: {
        status,
        handledById: handledById || null,
      },
    });
  }
}
