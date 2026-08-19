import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ThalassemiaService, CreateThalassemiaPatientDto } from './thalassemia.service';
import { Public } from '../rbac/decorators';

@Controller('thalassemia')
export class ThalassemiaController {
  constructor(private readonly thalassemiaService: ThalassemiaService) {}

  @Public()
  @Get()
  list() {
    return this.thalassemiaService.list();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateThalassemiaPatientDto) {
    return this.thalassemiaService.create(dto);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateThalassemiaPatientDto>) {
    return this.thalassemiaService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thalassemiaService.remove(id);
  }
}
