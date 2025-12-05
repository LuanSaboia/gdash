import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o Frontend acessar
  app.enableCors({
    origin: "*", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // O NestJS já carrega as rotas automaticamente pelos Módulos (AppModule -> AuthModule)
  // Não precisamos mais de app.use("/auth", ...)

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();