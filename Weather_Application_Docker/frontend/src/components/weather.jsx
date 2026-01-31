import { useState } from "react";
import axios from "axios";
import { MapPin, Wind, Cloud } from "lucide-react";
import "./Weather.css";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const getWeather = async () => {
  if (!city) return;

  setLoading(true);
  setError("");

  try {
    const res = await axios.get(
      `${API_BASE_URL}/weather/${city}`
    );

    setWeather(res.data);
  } catch (err) {
    console.error(err);
    setError("City not found");
    setWeather(null);
  } finally {
    setLoading(false);
  }
};
  

  const getWeatherIcon = (code) => {
    if (code <= 3) return "☀️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

  return (
    <div className="weather-container">
      <h1 className="title">Weather Forecast App</h1>

      <div className="search-box">
        <input
  type="text"
  placeholder="Enter city name..."
  value={city}
  onChange={(e) => {
    const value = e.target.value;
    setCity(value);

    if (value.trim() === "") {
      setWeather(null);
      setError("");
    }
  }}
  onKeyDown={(e) => e.key === "Enter" && getWeather()}
/>


        <button onClick={getWeather} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ✅ ONLY WEATHER CONDITION */}
      {weather && (
        <div className="card fade-in">
          <h2>
            <MapPin size={18} /> {weather.city}, {weather.country}
          </h2>

          <div className="temp">
            {getWeatherIcon(weather.weathercode)} {weather.temperature}°C
          </div>

          <div className="details">
            <p><Wind size={16} /> Wind: {weather.windspeed} km/h</p>
            <p><Cloud size={16} /> Code: {weather.weathercode}</p>
          </div>

          <small>Updated: {weather.time}</small>
        </div>
      )}
    </div>
  );
}

export default Weather;
