import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/gdash'),
    WeatherModule,
    InsightsModule,
  ],
})
export class AppModule {}
