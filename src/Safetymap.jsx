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

  // Track user location continuously
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(loc);
        localStorage.setItem("lastLocation", JSON.stringify(loc));
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Load last location when offline
  useEffect(() => {
    if (!isOnline) {
      const lastLoc = localStorage.getItem("lastLocation");
      if (lastLoc) setLocation(JSON.parse(lastLoc));
    }
  }, [isOnline]);

  // Initialize or update map
  useEffect(() => {
    if (!location || !mapContainer.current) return;

    if (!map.current) {
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

      map.current.addControl(new maplibregl.NavigationControl());
    } else {
      map.current.setCenter([location.longitude, location.latitude]);
    }

    // Remove existing markers and add a new one
    if (map.current._markers) map.current._markers.forEach((m) => m.remove());
    const marker = new maplibregl.Marker()
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);
    map.current._markers = [marker];
  }, [location]);

  // Fetch weather online or load last known
  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      if (!isOnline) {
        const lastWeather = localStorage.getItem("lastWeather");
        if (lastWeather) setWeather(JSON.parse(lastWeather));
        return;
      }

      setWeatherLoading(true);
      try {
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          current_weather: "true",
          timezone: "auto",
        });

        const res = await fetch(`${WEATHER_API_URL}?${params}`);
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const data = await res.json();

        if (data.current_weather) {
          const weatherData = {
            temp: data.current_weather.temperature,
            wind: data.current_weather.windspeed,
            weatherCode: data.current_weather.weathercode,
          };
          setWeather(weatherData);
          localStorage.setItem("lastWeather", JSON.stringify(weatherData));
        }
      } catch (err) {
        console.error("Weather fetch error:", err.message);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [isOnline, location]);

  const getWeatherDescription = (code) => {
    const codes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return codes[code] || "Unknown";
  };

  return (
    <div>
      <h1>Location Tracker</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {location && (
        <div>
          <p>Latitude: {location.latitude.toFixed(6)}</p>
          <p>Longitude: {location.longitude.toFixed(6)}</p>
          <p>Accuracy: ±{location.accuracy} m</p>
          {location.accuracy > 50 && (
            <p style={{ color: "orange" }}>
              Warning: Location may be inaccurate
            </p>
          )}
        </div>
      )}

      <div className="weather-box">
        <h3>Weather Details</h3>
        {weatherLoading ? (
          <p>Loading weather data...</p>
        ) : weather ? (
          <>
            <p>Temperature: {weather.temp}°C</p>
            <p>Wind: {weather.wind} km/h</p>
            <p>Condition: {getWeatherDescription(weather.weatherCode)}</p>
          </>
        ) : (
          <p>Weather data unavailable</p>
        )}
      </div>

      {isOnline ? (
        <div
          ref={mapContainer}
          className="map-container"
          style={{ width: "100%", height: "400px" }}
        />
      ) : (
        <div className="offline-box">
          <h3>Offline Mode</h3>
          <p>Map not available offline.</p>
        </div>
      )}
    </div>
  );
};

export default Safetymap;
