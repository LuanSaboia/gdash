import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se que o caminho está certo
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Injectable()
export class WeatherService {
  constructor(private prisma: PrismaService) {}

  // 1. Método para criar um log (chamado pelo Worker Go)
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

  // 2. Método para listar todos (chamado pelo Frontend)
  async findAll() {
    // Retorna os últimos 100 registros, ordenados do mais recente pro mais antigo
    return this.prisma.weatherLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }
}