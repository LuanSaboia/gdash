import { Controller, Get, Post, Body, Header } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async createLog(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    console.log('Recebido do Worker:', createWeatherLogDto);
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  async getLogs() {
    return this.weatherService.findAll();
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="dados_clima.csv"')
  async exportCsv() {
    return this.weatherService.generateCsv();
  }
}