import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Safetymap.css";

const Safetymap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Using a free weather API that doesn't require a key
  const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => setError(err.message)
      );
    } else {
      setError("Geolocation not supported by your browser");
    }
  }, []);

  // Initialize MapLibre map
  useEffect(() => {
    if (isOnline && location && mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [location.longitude, location.latitude],
        zoom: 12,
      });

      // Add marker at user location
      new maplibregl.Marker()
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);

      map.current.addControl(new maplibregl.NavigationControl());
    }
  }, [isOnline, location]);

  // Fetch online weather
  useEffect(() => {
    if (!isOnline || !location) return;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        // Using Open-Meteo API (free, no API key required)
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          current: 'temperature_2m,relative_humidity_2m,weather_code',
          timezone: 'auto'
        });
        
        const res = await fetch(`${WEATHER_API_URL}?${params}`);
        
        if (!res.ok) {
          throw new Error(`Weather API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Transform the data to match our expected format
        if (data.current) {
          setWeather({
            name: 'Current Location',
            main: {
              temp: Math.round(data.current.temperature_2m),
              humidity: data.current.relative_humidity_2m
            },
            weather: [{
              description: getWeatherDescription(data.current.weather_code)
            }]
          });
        }
      } catch (err) {
        console.log("Weather fetch error:", err.message);
        // Set fallback weather data
        setWeather({
          name: 'Current Location',
          main: {
            temp: 'N/A',
            humidity: 'N/A'
          },
          weather: [{
            description: 'Weather data unavailable'
          }]
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [isOnline, location]);

  // Helper function to convert weather codes to descriptions
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
  };

  return (
    <div>
      <h1>Location Tracker</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {location && (
        <div>
          <p>Latitude: {location.latitude.toFixed(6)}</p>
          <p>Longitude: {location.longitude.toFixed(6)}</p>
        </div>
      )}

      {isOnline && (
        <div className="weather-box">
          <h3>Weather Details</h3>
          {weatherLoading ? (
            <p>Loading weather data...</p>
          ) : weather ? (
            <>
              <p>Location: {weather.name}</p>
              <p>Temperature: {weather.main.temp}°C</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Condition: {weather.weather[0].description}</p>
            </>
          ) : (
            <p>Weather data not available</p>
          )}
        </div>
      )}

      {isOnline ? (
        <div
          ref={mapContainer}
          className="map-container"
          style={{ width: "100%", height: "400px" }}
        />
      ) : (
        <div className="offline-box">
          <h3>Offline Mode</h3>
          <p>Map not available.</p>
          {weather ? (
            <div>
              <p>Last known weather:</p>
              <p>Temperature: {weather.main.temp}°C</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Condition: {weather.weather[0].description}</p>
            </div>
          ) : (
            <p>Weather data not available offline.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Safetymap;
