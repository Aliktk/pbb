import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PartnersService, CreatePartnerDto } from './partners.service';
import { Public } from '../rbac/decorators';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Public()
  @Get()
  list() {
    return this.partnersService.list();
  }

  @Public()
  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePartnerDto>) {
    return this.partnersService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
