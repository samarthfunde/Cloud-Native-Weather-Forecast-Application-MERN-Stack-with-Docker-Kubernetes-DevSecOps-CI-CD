import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import Weather from "./models/weather.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    const cityInfo = geoRes.data.results[0];

    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.latitude}&longitude=${cityInfo.longitude}&current_weather=true`
    );

    const newWeather = new Weather({
      city: cityInfo.name,
      country: cityInfo.country,
      temperature: weatherRes.data.current_weather.temperature,
      windspeed: weatherRes.data.current_weather.windspeed,
      weathercode: weatherRes.data.current_weather.weathercode,
      latitude: cityInfo.latitude,
      longitude: cityInfo.longitude,
    });

    await newWeather.save();

    res.json({
      city: cityInfo.name,
      country: cityInfo.country,
      temperature: weatherRes.data.current_weather.temperature,
      windspeed: weatherRes.data.current_weather.windspeed,
      weathercode: weatherRes.data.current_weather.weathercode,
      time: weatherRes.data.current_weather.time,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
