import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PIN_COLORS = new Set(['#2dd4a7', '#e8a33d', '#f87171']);

function makeIcon(color) {
  // The colour is interpolated into markup, so only allow known hex values.
  const pin = PIN_COLORS.has(color) ? color : '#e8a33d';
  return L.divIcon({
    className: '',
    html: `<div class="saans-pin" style="--pin:${pin}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function LocationMap({ lat, lon, color }) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={12}
      style={{ height: '200px', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl
    >
      <TileLayer
        className="map-tiles"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[lat, lon]} icon={makeIcon(color)} />
    </MapContainer>
  );
}
