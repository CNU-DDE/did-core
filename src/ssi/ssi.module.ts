import { Module } from '@nestjs/common';
import { SsiController } from './ssi.controller';
import { SsiService } from './ssi.service';

@Module({
  controllers: [SsiController],
  providers: [SsiService]
})
export class SsiModule {}
