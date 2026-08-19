import { Module } from '@nestjs/common';
import { ThalassemiaController } from './thalassemia.controller';
import { ThalassemiaService } from './thalassemia.service';

@Module({
  controllers: [ThalassemiaController],
  providers: [ThalassemiaService],
  exports: [ThalassemiaService],
})
export class ThalassemiaModule {}
