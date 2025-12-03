import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Weather extends Document {
  @Prop()
  fetched_at: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ type: Object })
  current_weather: any;

  @Prop({ type: Object })
  hourly: any;

  @Prop()
  humidity: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
