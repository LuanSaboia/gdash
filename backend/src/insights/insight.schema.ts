import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type InsightDocument = HydratedDocument<Insight>;

@Schema({ timestamps: true })
export class Insight {

  @Prop({ required: true })
  text: string;

  @Prop({ type: Object, required: true })
  weatherSnapshot: any;  // <-- CORRIGIDO

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);
