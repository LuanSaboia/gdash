import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [WeatherModule,
    InsightsModule,
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
