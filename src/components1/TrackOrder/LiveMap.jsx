import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(points, {
      padding: [50, 50],
    });
  }, [map, points]);

  return null;
}

const storePosition = [33.5138, 36.2765];
const customerPosition = [33.5050, 36.2950];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function LiveMap() {
  const [driverPosition, setDriverPosition] = useState([
    33.5120,
    36.2810,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosition((prev) => [
        prev[0] - 0.0001,
        prev[1] + 0.0001,
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const route = [
    storePosition,
    driverPosition,
    customerPosition,
  ];

  const distance = calculateDistance(
    driverPosition[0],
    driverPosition[1],
    customerPosition[0],
    customerPosition[1]
  );

  const eta = Math.ceil(distance / 0.5);

  return (
    <>
      <div
        style={{
          background: "#fff",
          padding: "12px",
          borderRadius: "12px",
          marginBottom: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <strong>🚴 Ahmad Al-Mohammad</strong>

        <div style={{ marginTop: "5px" }}>
          📍 {distance.toFixed(1)} km away
        </div>

        <div>⏱ ETA {eta} min</div>
      </div>

      <MapContainer
        center={driverPosition}
        zoom={14}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={storePosition}>
          <Popup>🏪 Store</Popup>
        </Marker>

        <Marker position={customerPosition}>
          <Popup>🏠 Customer</Popup>
        </Marker>

        <Marker position={driverPosition}>
          <Popup>🚴 Driver</Popup>
        </Marker>

        <Polyline
          positions={route}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
          }}
        />

        <FitBounds points={route} />
      </MapContainer>
    </>
  );
}

export default LiveMap;