// backend/index.js
import express from "express";
import axios from "axios";
import cors from "cors";
import connectDB from "./db.js";
// import model correctly

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Weather API route
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // 1️⃣ Get latitude & longitude
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );

    if (!geoRes.data.results) {
      return res.status(404).json({ message: "City not found" });
    }

    const cityInfo = geoRes.data.results[0];

    // 2️⃣ Get weather using lat & long
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.latitude}&longitude=${cityInfo.longitude}&current_weather=true`
    );

    // 3️⃣ Save to MongoDB
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

    // 4️⃣ Send response
    res.json({
      cityInfo,
      temperature: weatherRes.data.current_weather.temperature,
      windspeed: weatherRes.data.current_weather.windspeed,
      weathercode: weatherRes.data.current_weather.weathercode,
      time: weatherRes.data.current_weather.time,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
