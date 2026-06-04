import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import type { Ruta } from '../types/domain'
import styles from './RouteMap.module.css'

interface RouteMapProps {
  ruta: Ruta
}

function parseGeometry(routeGeometryJson: string | null) {
  if (!routeGeometryJson) {
    return []
  }

  try {
    const geometry = JSON.parse(routeGeometryJson) as {
      coordinates?: Array<[number, number]>
    }

    return (geometry.coordinates || []).map(([lng, lat]) => [lat, lng] as [number, number])
  } catch {
    return []
  }
}

export default function RouteMap({ ruta }: RouteMapProps) {
  const polyline = parseGeometry(ruta.routeGeometryJson)
  const center = polyline[0] || [ruta.origenLat, ruta.origenLng]

  return (
    <div className={styles.frame}>
      <MapContainer center={center} zoom={12} className={styles.map} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker center={[ruta.origenLat, ruta.origenLng]} radius={10} pathOptions={{ color: '#d44c16' }}>
          <Popup>Origen del día: {ruta.origenTexto}</Popup>
        </CircleMarker>

        {ruta.rutaPedidos.map((rutaPedido) => (
          <CircleMarker
            key={rutaPedido.id}
            center={[rutaPedido.pedido.lat || ruta.origenLat, rutaPedido.pedido.lng || ruta.origenLng]}
            radius={8}
            pathOptions={{ color: '#163560' }}
          >
            <Popup>
              #{rutaPedido.ordenVisita} - {rutaPedido.pedido.direccionDestino}
            </Popup>
          </CircleMarker>
        ))}

        {polyline.length > 1 && (
          <Polyline positions={polyline} pathOptions={{ color: '#ef7f32', weight: 5 }} />
        )}
      </MapContainer>
    </div>
  )
}
