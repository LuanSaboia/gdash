import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import authRoutes from './routes/authRoutes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",        // libera tudo por enquanto
    methods: "GET,POST",
  });

  app.use("/auth", authRoutes);
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
