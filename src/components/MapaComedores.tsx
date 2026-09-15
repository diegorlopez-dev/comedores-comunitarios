import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix de iconos para React Leaflet + Vite usando CDN
const iconDefault = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

// Icono rojo para el usuario
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface ComedorMapa {
  id: string;
  nombre: string;
  barrio: string;
  latitud: number | null;
  longitud: number | null;
}

interface MapaComedoresProps {
  comedores: ComedorMapa[];
  userLocation: { lat: number; lng: number } | null;
}

const CenterUpdater = ({ userLocation }: { userLocation: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true });
    }
  }, [userLocation, map]);
  return null;
};

const MapaComedores: React.FC<MapaComedoresProps> = ({ comedores, userLocation }) => {
  const defaultCenter: [number, number] = [-34.6037, -58.3816]; // Obelisco, CABA

  return (
    <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <CenterUpdater userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong className="text-red-600">¡Estás acá!</strong>
                <p className="text-xs text-gray-500 m-0">Tu ubicación actual</p>
              </div>
            </Popup>
          </Marker>
        )}

        {comedores.map(c => {
          if (c.latitud && c.longitud) {
            return (
              <Marker key={c.id} position={[c.latitud, c.longitud]}>
                <Popup>
                  <strong>{c.nombre}</strong><br/>
                  📍 {c.barrio}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default MapaComedores;
