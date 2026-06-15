import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const storePosition = [33.5138, 36.2765];
const customerPosition = [33.5050, 36.2950];
const driverPosition = [33.5090, 36.2860];

const storeIcon = new L.DivIcon({
  html: "🏪",
  className: "",
  iconSize: [30, 30],
});

const customerIcon = new L.DivIcon({
  html: "🏠",
  className: "",
  iconSize: [30, 30],
});

const driverIcon = new L.DivIcon({
  html: "🚴",
  className: "",
  iconSize: [30, 30],
});

function LiveMap() {
  return (
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

      <Marker position={storePosition} icon={storeIcon}>
        <Popup>Store Location</Popup>
      </Marker>

      <Marker position={customerPosition} icon={customerIcon}>
        <Popup>Customer Address</Popup>
      </Marker>

      <Marker position={driverPosition} icon={driverIcon}>
        <Popup>Driver Location</Popup>
      </Marker>
    </MapContainer>
  );
}

export default LiveMap;