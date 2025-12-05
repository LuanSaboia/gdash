import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai'; // <--- Importação correta da lib nova

@Injectable()
export class InsightsService {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    // Inicializa com a chave do .env (igual ao seu snippet)
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generate() {
    // 1. Busca os últimos 5 registros de clima para dar contexto
    const logs = await this.prisma.weatherLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (logs.length === 0) {
      return { message: 'Sem dados suficientes para análise.' };
    }

    const latest = logs[0];
    
    // 2. Monta o prompt
    const prompt = `
      Atue como um meteorologista assistente.
      Analise estes dados da cidade de ${latest.city}:
      - Temperatura: ${latest.temperature}°C
      - Umidade: ${latest.humidity}%
      - Vento: ${latest.windSpeed} km/h
      - Condição: ${latest.condition}
      
      Histórico recente: ${logs.map(l => `${l.temperature}°C`).join(', ')}.
      
      Gere uma frase curta e útil para o cidadão (ex: "Leve guarda-chuva" ou "Hidrate-se bem").
    `;

    try {
      // 3. Chamada correta usando a sintaxe do SDK @google/genai
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash', // Usando o 1.5 Flash que é estável e rápido
        contents: prompt, // O SDK novo aceita string direta aqui
      });

      // A propriedade .text contém a resposta (conforme seu snippet e documentação nova)
      const text = response.text; 
      
      if (!text) {
        throw new Error("Resposta vazia da IA");
      }

      // 4. Salva no banco
      return this.prisma.insight.create({
        data: {
          summary: text, // Salva o texto limpo
          date: new Date(),
        },
      });

    } catch (error: any) {
        console.error('Erro detalhado da IA:', error); // Mantém log no terminal
        
        // TRUQUE: Salva o erro técnico no resumo para vermos no Frontend
        const errorMessage = error?.message || JSON.stringify(error);
        
        return this.prisma.insight.create({
          data: {
            summary: `FALHA: ${errorMessage}`, // <--- Isso vai aparecer no card
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