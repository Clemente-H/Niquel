import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IGeoPoint } from '../../types/geoPoint.types';

// Asegúrate de que los íconos de Leaflet se carguen correctamente
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para cargar un archivo KML
const KmlLayer = ({ kmlUrl }: { kmlUrl: string }) => {
  const map = useMap();

  useEffect(() => {
    if (!kmlUrl) return;

    // Create a new KML layer using omnivore
    const kmlLayer = (L as any).geoJSON.ajax(kmlUrl);

    // Add the layer to the map
    kmlLayer.addTo(map);

    // Fit the map to the bounds of the KML layer
    kmlLayer.on('data:loaded', () => {
      map.fitBounds(kmlLayer.getBounds());
    });

    return () => {
      map.removeLayer(kmlLayer);
    };
  }, [map, kmlUrl]);

  return null;
};

// Iconos para puntos de colores según nivel de gravedad
const gravityIcons = {
  1: new L.Icon({ // Verde
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  2: new L.Icon({ // Amarillo
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  3: new L.Icon({ // Rojo
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
};

interface MapViewerProps {
  kmlUrl?: string;
  geoPoints?: IGeoPoint[];
  onPointClick?: (point: IGeoPoint) => void;
  height?: string | number;
  width?: string | number;
  className?: string;
  center?: [number, number]; // lat, lng
  zoom?: number;
  editable?: boolean;
}

const MapViewer: React.FC<MapViewerProps> = ({
  kmlUrl,
  geoPoints = [],
  onPointClick,
  height = '500px',
  width = '100%',
  className = '',
  center = [0, 0],
  zoom = 2,
  editable = false
}) => {
  const [selectedPoint, setSelectedPoint] = useState<IGeoPoint | null>(null);

  const handlePointClick = (point: IGeoPoint) => {
    setSelectedPoint(point);
    if (onPointClick) {
      onPointClick(point);
    }
  };

  return (
    <div style={{ height, width }} className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {kmlUrl && <KmlLayer kmlUrl={kmlUrl} />}

        {geoPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={gravityIcons[point.gravityLevel as 1 | 2 | 3] || DefaultIcon}
            eventHandlers={{
              click: () => handlePointClick(point)
            }}
          >
            <Popup>
              <div>
                <h3>Punto: {point.kilometer ? `${point.kilometer} km` : 'Sin km'}</h3>
                {point.section && <p>Sección: {point.section}</p>}
                <p>Nivel: {
                  point.gravityLevel === 1 ? 'Bajo (Verde)' :
                  point.gravityLevel === 2 ? 'Medio (Amarillo)' :
                  point.gravityLevel === 3 ? 'Alto (Rojo)' : 'Desconocido'
                }</p>
                {point.description && <p>{point.description}</p>}
                <button
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handlePointClick(point)}
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
