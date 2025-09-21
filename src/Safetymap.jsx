import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Safetymap.css';

const Safetymap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get user location with high accuracy
  const getLocation = (highAccuracy = true) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Clear any existing watcher
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge: 0 // Always get a fresh location
    };

    const newWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        setIsLoading(false);
        
        // Update map if it exists
        if (map.current) {
          map.current.setCenter([newLocation.longitude, newLocation.latitude]);
          if (marker.current) {
            marker.current.setLngLat([newLocation.longitude, newLocation.latitude]);
          }
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setIsLoading(false);
        
        // Try with lower accuracy if high accuracy failed
        if (highAccuracy && err.code === err.TIMEOUT) {
          setError('High accuracy location timed out. Trying with standard accuracy...');
          setTimeout(() => getLocation(false), 1000);
        }
      },
      options
    );

    setWatchId(newWatchId);
  };

  // Get weather data using Open-Meteo API
  const fetchWeatherData = async (lat, lng) => {
    if (!isOnline) {
      setWeatherError('Cannot fetch weather data while offline');
      return;
    }

    try {
      setWeatherError(null);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (err) {
      console.error('Weather fetch error:', err.message);
      setWeatherError(err.message);
    }
  };

  // Get location on component mount
  useEffect(() => {
    getLocation();
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Fetch weather when location changes
  useEffect(() => {
    if (location && isOnline) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location, isOnline]);

  // Initialize MapLibre map
  useEffect(() => {
    if (location && mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            },
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [location.longitude, location.latitude],
        zoom: 15,
      });

      // Add marker at user location
      marker.current = new maplibregl.Marker({
        color: '#FF0000',
        draggable: false
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);

      map.current.addControl(new maplibregl.NavigationControl());
    }
  }, [location]);

  // Weather code to description mapping
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
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
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
    
    return weatherCodes[code] || 'Unknown weather condition';
  };

  return (
    <div className="location-tracker">
      <div className="header">
        <h1>Location & Weather Tracker</h1>
        <div className={`status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your location with high accuracy...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <span>⚠️</span> {error}
        </div>
      )}

      {location && (
        <div className="location-info">
          <h2>Your Current Location</h2>
          <div className="coordinates">
            <div className="coordinate">
              <span className="label">Latitude:</span>
              <span className="value">{location.latitude.toFixed(6)}</span>
            </div>
            <div className="coordinate">
              <span className="label">Longitude:</span>
              <span className="value">{location.longitude.toFixed(6)}</span>
            </div>
            {accuracy && (
              <div className="coordinate">
                <span className="label">Accuracy:</span>
                <span className="value">±{accuracy.toFixed(2)} meters</span>
              </div>
            )}
          </div>
          <button onClick={() => getLocation()} className="refresh-btn">
            Refresh Location
          </button>
        </div>
      )}

      {weather && (
        <div className="weather-info">
          <h2>Current Weather</h2>
          <div className="weather-data">
            <div className="weather-item">
              <span className="label">Temperature:</span>
              <span className="value">{weather.temperature}°C</span>
            </div>
            <div className="weather-item">
              <span className="label">Conditions:</span>
              <span className="value">{getWeatherDescription(weather.weathercode)}</span>
            </div>
            <div className="weather-item">
              <span className="label">Wind Speed:</span>
              <span className="value">{weather.windspeed} km/h</span>
            </div>
            <div className="weather-item">
              <span className="label">Wind Direction:</span>
              <span className="value">{weather.winddirection}°</span>
            </div>
          </div>
        </div>
      )}

      {weatherError && (
        <div className="error">
          <span>⚠️</span> Weather data unavailable: {weatherError}
        </div>
      )}

      <div 
        ref={mapContainer} 
        className="map-container"
        style={{ display: location ? 'block' : 'none' }}
      />

      {!location && !isLoading && (
        <div className="no-location">
          <p>Unable to determine your location. Please check your browser permissions.</p>
          <button onClick={() => getLocation()} className="refresh-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="help-section">
        <h3>Location Accuracy Tips</h3>
        <ul>
          <li>Make sure you've granted location permissions to your browser</li>
          <li>Try using a different browser (Chrome usually has the best geolocation support)</li>
          <li>Ensure your device's location services are turned on</li>
          <li>For better accuracy, connect to WiFi or ensure good cellular signal</li>
          <li>GPS works best outdoors with a clear view of the sky</li>
        </ul>
      </div>
    </div>
  );
};

export default Safetymap;