import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Response } from 'express';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  async create(@Body() data: any) {
    return this.weatherService.create(data);
  }

  // 🔥 Listagem paginada (frontend)
  @Get()
  async list(
    @Query("limit") limit = 20,
    @Query("skip") skip = 0
  ) {
    return this.weatherService.findPaginated(Number(limit), Number(skip));
  }

  // 🔥 Exportação CSV
  @Get("export")
  async exportCsv(@Res() res) {
    const csv = await this.weatherService.exportCSV();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=weather-history.csv"
    );

    res.send(csv);
  }

  @Get("last-24h")
  async last24h() {
    return this.weatherService.getLast24Hours();
  }

}
