import { Controller, Get, Post, Body } from "@nestjs/common";
import { InsightsService } from "./insights.service";

@Controller("api/insights")
export class InsightsController {
  constructor(private service: InsightsService) {}

  @Get()
  async list() {
    return this.service.list();
  }

  @Post()
  async create(@Body() data: any) {
    return this.service.generate(data);
  }
}
