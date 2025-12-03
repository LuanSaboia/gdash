import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Insight, InsightSchema } from "./insight.schema";
import { InsightsService } from "./insights.service";
import { InsightsController } from "./insights.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
