import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VolunteersService, CreateVolunteerDto } from './volunteers.service';
import { Public, Permissions } from '../rbac/decorators';
import { VolunteerStatus } from '@prisma/client';

export class UpdateVolunteerStatusDto {
  status?: VolunteerStatus;
  stage?: string;
}

@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Public()
  @Get()
  list(@Query('status') status?: VolunteerStatus) {
    return this.volunteersService.list(status);
  }

  @Public()
  @Post()
  create(@Body() dto: CreateVolunteerDto) {
    return this.volunteersService.create(dto);
  }

  @Public()
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVolunteerStatusDto) {
    const st = dto.status || (dto.stage === 'active' ? VolunteerStatus.ACTIVE : dto.stage === 'contacted' ? VolunteerStatus.ACTIVE : VolunteerStatus.APPLIED);
    return this.volunteersService.updateStatus(id, st);
  }

  @Public()
  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateVolunteerStatusDto) {
    const st = dto.status || (dto.stage === 'active' ? VolunteerStatus.ACTIVE : dto.stage === 'contacted' ? VolunteerStatus.ACTIVE : VolunteerStatus.APPLIED);
    return this.volunteersService.updateStatus(id, st);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateVolunteerDto> & { status?: VolunteerStatus }) {
    return this.volunteersService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteersService.remove(id);
  }
}
