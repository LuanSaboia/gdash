import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Injectable()
export class WeatherService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWeatherLogDto) {
    return this.prisma.weatherLog.create({
      data: {
        city: data.city,
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        condition: data.condition,
      },
    });
  }

  async findAll() {
    // Retorna os últimos 100 registros do mais recente pro mais antigo
    return this.prisma.weatherLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  async generateCsv() {
    const logs = await this.prisma.weatherLog.findMany({
      orderBy: { createdAt: 'desc' }, // Pega do mais recente pro mais antigo
    });

    // Cabeçalho do CSV
    const header = 'Cidade,Temperatura,Umidade,Vento,Condicao,Data\n';

    // Linhas do CSV
    const rows = logs.map((log) => 
      `${log.city},${log.temperature},${log.humidity},${log.windSpeed},${log.condition},${log.createdAt.toISOString()}`
    ).join('\n');

    return header + rows;
  }
}