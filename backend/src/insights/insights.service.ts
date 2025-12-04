import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  // Resolve o erro: Property 'generate' does not exist
  async generate() {
    // AQUI entraria a chamada para o Gemini/OpenAI.
    // Por enquanto, vamos simular uma resposta baseada nos dados do banco.
    
    // 1. Busca dados recentes do clima
    const weatherLogs = await this.prisma.weatherLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (weatherLogs.length === 0) {
      return { message: "Sem dados suficientes para gerar insights." };
    }

    // 2. Simula uma análise (Substitua isso pela chamada real da IA)
    const lastTemp = weatherLogs[0].temperature;
    const mockAnalysis = `A temperatura atual é de ${lastTemp}°C. Baseado nos últimos registros, o clima está estável.`;

    // 3. Salva o insight no banco
    const insight = await this.prisma.insight.create({
      data: {
        summary: mockAnalysis,
        date: new Date(),
      },
    });

    return insight;
  }

  // Resolve o erro: Property 'list' does not exist
  async list() {
    return this.prisma.insight.findMany({
      orderBy: { date: 'desc' },
      take: 20, // Retorna os últimos 20 insights
    });
  }
}