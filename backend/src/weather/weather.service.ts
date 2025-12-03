import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather } from './weather.schema';
import { InsightsService } from '../insights/insights.service';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<Weather>,
    private insightsService: InsightsService,
  ) {}

  // 🔥 Salva clima e gera insight automático
  async create(data: any) {
    const doc = await new this.weatherModel(data).save();

    try {
      await this.insightsService.generate(doc);
    } catch (err) {
      console.error("Erro ao gerar insight:", err);
    }

    return doc;
  }

  // 🔥 Paginação usada no histórico (/api/weather?limit=20&skip=0)
  async findPaginated(limit: number, skip: number) {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  // 🔥 Geração de CSV
  async exportCSV() {
    const rows = await this.weatherModel
      .find()
      .sort({ createdAt: -1 });

    let csv = "fetched_at,temperature,humidity,weathercode\n";

    for (const r of rows) {
      csv += `${r.fetched_at},${r.current_weather?.temperature ?? ""},${r.current_weather?.humidity ?? ""},${r.current_weather?.weathercode ?? ""}\n`;
    }

    return csv;
  }

  async getLast24Hours() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const data = await this.weatherModel
    .find({ createdAt: { $gte: since } })
    .sort({ createdAt: 1 }) // ordem cronológica
    .select({
      createdAt: 1,
      "current_weather.temperature": 1,
    });

  return data.map((doc) => ({
    time: doc.createdAt,
    temperature: doc.current_weather?.temperature ?? null,
  }));
}

}
