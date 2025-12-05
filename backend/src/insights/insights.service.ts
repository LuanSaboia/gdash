import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class InsightsService {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generate() {
    const logs = await this.prisma.weatherLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (logs.length === 0) {
      return { message: 'Sem dados suficientes para análise.' };
    }

    const latest = logs[0];
    
    const prompt = `
      Você é um assistente meteorológico objetivo.
      Dados de ${latest.city}:
      - Temp: ${latest.temperature}°C
      - Umidade: ${latest.humidity}%
      - Vento: ${latest.windSpeed} km/h
      - Condição: ${latest.condition}
      
      Histórico recente: ${logs.map(l => `${l.temperature}°C`).join(', ')}.
      
      REGRA DE RESPOSTA:
      - Responda em APENAS 2 frases curtas e diretas.
      - NÃO use listas, tópicos ou negrito (**).
      - Frase 1: Resumo da situação atual (ex: "Calor intenso com umidade crítica").
      - Frase 2: Recomendação prática (ex: "Evite o sol e beba água").
      
      Exemplo ideal: "A temperatura está muito alta e o ar seco. Hidrate-se constantemente e evite atividades ao ar livre."
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // Usando o 2.5 Flash que é estável e rápido
        contents: prompt,
      });

      const text = response.text; 
      
      if (!text) {
        throw new Error("Resposta vazia da IA");
      }

      return this.prisma.insight.create({
        data: {
          summary: text,
          date: new Date(),
        },
      });

    } catch (error: any) {
        console.error('Erro detalhado da IA:', error);
        
        const errorMessage = error?.message || JSON.stringify(error);
        
        // Mensagem de erro no card para tratar problemas
        return this.prisma.insight.create({
          data: {
            summary: `FALHA: ${errorMessage}`,
            date: new Date(),
          },
        });
      }
    }

  async list() {
    return this.prisma.insight.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });
  }
}