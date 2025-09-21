
import React, { useState, useEffect } from "react";
import "./TouristApp.css";

export default function TouristApp() {
  const [safetyScore, setSafetyScore] = useState(85);
  const [currentLocation, setCurrentLocation] = useState("Shillong, Meghalaya");
  const [isInSafeZone, setIsInSafeZone] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => {
      setSafetyScore((prev) => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setBatteryLevel((prev) => Math.max(10, prev - 0.1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleEmergencyCall = () => {
    alert("Emergency services contacted! Your location has been shared.");
  };

  const handleSOSPress = () => {
    alert("SOS signal sent! Emergency contacts and nearest police station notified.");
  };

  return (
    <div className="tourist-app">
      <header className="nav-header">
        <h1>Tourist Safety</h1>
        <p>Stay safe, explore freely</p>
        <div className="battery-wifi">
          <span>🔋 {batteryLevel.toFixed(0)}%</span>
          <span>📶</span>
        </div>
      </header>

      <main className="main-container">
        <section className={`card ${isInSafeZone ? "safe" : "danger"}`}>
          <div className="card-title">
            <span>🛡️ Safety Score</span>
            <span className={`badge ${isInSafeZone ? "badge-safe" : "badge-danger"}`}>{safetyScore.toFixed(0)}/100</span>
          </div>
          <progress value={safetyScore} max="100" />
          <p className="muted-text">
            {isInSafeZone ? "You're in a safe zone" : "Exercise caution in this area"}
          </p>
        </section>

        <section className="card">
          <div className="card-title">
            <span>📍 Current Location</span>
          </div>
          <p>{currentLocation}</p>
          <small className="muted-text">🕒 Last updated: {new Date().toLocaleTimeString()}</small>
        </section>

        <div className="grid-2 emergency-actions">
          <button className="btn-danger" onClick={handleSOSPress}>⚠️ SOS</button>
          <button className="btn-outline" onClick={handleEmergencyCall}>📞 Emergency</button>
        </div>

        <div className="grid-2 quick-actions">
          <div className="card action">🧭 Navigation<br /><small>Safe routes</small></div>
          <div className="card action">👥 Find Groups<br /><small>Join tours</small></div>
          <div className="card action">📷 Report Issue<br /><small>Photo evidence</small></div>
          <div className="card action">💬 Help Chat<br /><small>24/7 support</small></div>
        </div>

        {!isInSafeZone && (
          <div className="alert alert-danger">
            ⚠️ You are approaching a restricted area. Please follow the suggested safe route or contact authorities.
          </div>
        )}

        <section className="card">
          <h3>Nearby Services</h3>
          <div className="service">
            <span>🛡️ Police Station</span>
            <small>0.8 km away · ⭐ 4.5</small>
          </div>
          <div className="service">
            <span>📞 Hospital</span>
            <small>1.2 km away · ⭐ 4.8</small>
          </div>
          <div className="service">
            <span>📍 Tourist Info Center</span>
            <small>0.5 km away · ⭐ 4.7</small>
          </div>
        </section>
      </main>
    </div>
  );
}
