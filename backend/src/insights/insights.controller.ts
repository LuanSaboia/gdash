import { Controller, Get, Post } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('api/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  // Rota para o Frontend buscar o histórico: GET /api/insights
  @Get()
  async getInsights() {
    return this.insightsService.list();
  }

  // Rota para forçar a geração de um novo insight: POST /api/insights/generate
  @Post('generate')
  async generateInsight() {
    return this.insightsService.generate();
  }
}