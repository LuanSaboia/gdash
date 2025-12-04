import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Conecta com o Prisma
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}