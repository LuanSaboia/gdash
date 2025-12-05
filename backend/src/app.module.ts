import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ExplorerModule } from './explorer/explorer.module';

@Module({
  imports: [WeatherModule,
    InsightsModule,
    AuthModule,
    PrismaModule,
    UsersModule,
    ExplorerModule
  ],
})
export class AppModule {}
