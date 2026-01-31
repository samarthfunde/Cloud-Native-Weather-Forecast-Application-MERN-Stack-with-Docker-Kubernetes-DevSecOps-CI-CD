import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema(
  {
    city: String,
    country: String,
    temperature: Number,
    windspeed: Number,
    weathercode: Number,
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

const Weather = mongoose.model("Weather", weatherSchema);

export default Weather;
