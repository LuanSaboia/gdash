import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './weather.schema';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { InsightsModule } from '../insights/insights.module'; // 👈 importar aqui

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
    InsightsModule, // 👈 adicionar aqui
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
