import mongoose from "mongoose";

const WeatherSchema = new mongoose.Schema({
  fetched_at: String,
  latitude: String,
  longitude: String,
  current_weather: Object,
  hourly: Object,
  humidity: Number

}, { timestamps: true });

export default mongoose.model("Weather", WeatherSchema);
