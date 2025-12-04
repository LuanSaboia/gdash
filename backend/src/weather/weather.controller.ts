import { Controller, Get, Post, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Controller('api/weather') // Prefixo da rota
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // ROTA 1: Recebe dados do Worker (POST http://localhost:3000/api/weather/logs)
  @Post('logs')
  async createLog(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    console.log('Recebido do Worker:', createWeatherLogDto); // Log para debug
    return this.weatherService.create(createWeatherLogDto);
  }

  // ROTA 2: Envia dados para o Frontend (GET http://localhost:3000/api/weather/logs)
  @Get('logs')
  async getLogs() {
    return this.weatherService.findAll();
  }
}