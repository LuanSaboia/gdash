import { Controller, Get, Post } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('api/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  async getInsights() {
    return this.insightsService.list();
  }

  @Post('generate')
  async generateInsight() {
    return this.insightsService.generate();
  }
}