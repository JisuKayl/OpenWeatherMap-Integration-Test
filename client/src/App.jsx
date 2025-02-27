import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import {
  WiDaySunny,
  WiThermometer,
  WiHumidity,
  WiStrongWind,
} from "react-icons/wi";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/weather?city=${encodeURIComponent(city)}`
      );
      setWeatherData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch weather data");
      setLoading(false);
      setWeatherData(null); // Reset weather data on error
    }
  };

  const groupForecastsByDay = (list) => {
    const groupedForecast = {};

    list?.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!groupedForecast[day]) {
        groupedForecast[day] = [];
      }

      groupedForecast[day].push(item);
    });

    return groupedForecast;
  };

  const groupedForecasts =
    weatherData && weatherData.list
      ? groupForecastsByDay(weatherData.list)
      : {};

  const WeatherCard = ({ day, forecast, allForecasts }) => {
    const [expanded, setExpanded] = useState(false);

    const date = new Date(forecast.dt * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const { main, weather, wind } = forecast;
    const weatherIcon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const temps = allForecasts.map((item) => item.main.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    return (
      <div
        className={`weather-card ${expanded ? "expanded" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="weather-card-basic">
          <div className="day-info">
            <h3>{day}</h3>
            <p className="date">{formattedDate}</p>
          </div>

          <div className="weather-icon">
            <img src={weatherIcon} alt={weather[0].description} />
            <p>{weather[0].main}</p>
          </div>

          <div className="temperature">
            <p className="temp-max">{Math.round(maxTemp)}°C</p>
            <p className="temp-min">{Math.round(minTemp)}°C</p>
          </div>
        </div>

        {expanded && (
          <div className="weather-card-details">
            <div className="detail-item">
              <WiThermometer />
              <p>Feels like: {Math.round(main.feels_like)}°C</p>
            </div>
            <div className="detail-item">
              <WiHumidity />
              <p>Humidity: {main.humidity}%</p>
            </div>
            <div className="detail-item">
              <WiStrongWind />
              <p>Wind: {Math.round(wind.speed * 3.6)} km/h</p>
            </div>
            <p className="description">{weather[0].description}</p>

            <div className="hourly-forecast">
              {allForecasts.slice(0, 4).map((hourForecast, index) => {
                const hourDate = new Date(hourForecast.dt * 1000);
                const hour = hourDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  hour12: true,
                });

                return (
                  <div key={index} className="hour-item">
                    <p>{hour}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${hourForecast.weather[0].icon}.png`}
                      alt={hourForecast.weather[0].description}
                    />
                    <p>{Math.round(hourForecast.main.temp)}°C</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <WiDaySunny className="logo-icon" />
          <h1>Weather Forecast</h1>
        </div>
      </header>

      <main className="container">
        <div className="search-container">
          <form onSubmit={fetchWeather}>
            <div className="search-box">
              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {weatherData && weatherData.city && !loading && !error && (
          <div className="forecast-container">
            <div className="city-info">
              <h2>
                {weatherData.city.name}, {weatherData.city.country}
              </h2>
            </div>

            <div className="forecast-list">
              {Object.entries(groupedForecasts).map(([day, items]) => {
                const dayForecast =
                  items.find((item) => {
                    const date = new Date(item.dt * 1000);
                    return date.getHours() >= 12 && date.getHours() <= 15;
                  }) || items[0];

                return (
                  <WeatherCard
                    key={day}
                    day={day}
                    forecast={dayForecast}
                    allForecasts={items}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
