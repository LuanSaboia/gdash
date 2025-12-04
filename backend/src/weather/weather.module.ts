import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importa o Prisma

@Module({
  imports: [PrismaModule], // <--- Apenas o Prisma, nada de MongooseModule
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}