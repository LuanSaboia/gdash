import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Insight } from "./insight.schema";

// Google Gemini
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class InsightsService {
  private genAI: GoogleGenAI;

  constructor(
    @InjectModel(Insight.name) private insightModel: Model<Insight>,
  ) {
    // carrega API KEY do ambiente
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // ========================================================
  // LISTA OS INSIGHTS SALVOS NO BANCO
  // ========================================================
  async list() {
    return this.insightModel
      .find()
      .sort({ createdAt: -1 })
      .limit(50);
  }

  // ========================================================
  // GERA E SALVA UM INSIGHT COM GEMINI
  // ========================================================
  async generate(weather: any) {
    try {
      const prompt = `
      Gere um insight curto e objetivo sobre os dados climáticos recebidos:

      ${JSON.stringify(weather, null, 2)}
      `;

      // chamada ao Gemini
      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const insightText = result.text;

      // salva no mongo
      const saved = await this.insightModel.create({
        text: insightText,
        weatherSnapshot: weather,
        createdAt: new Date(),
      });

      return saved;

    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      throw error;
    }
  }
}
