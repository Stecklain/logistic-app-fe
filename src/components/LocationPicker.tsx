import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet'
import styles from './LocationPicker.module.css'

interface Coords {
  lat: number
  lng: number
}

interface AddressFields {
  direccionDestino: string
  localidad: string
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    suburb?: string
    municipality?: string
    county?: string
  }
}

interface Props {
  value: Coords | null
  onChange: (coords: Coords, address?: AddressFields) => void
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]
const NOMINATIM = 'https://nominatim.openstreetmap.org'
const NOMINATIM_HEADERS = { 'Accept-Language': 'es' }

function parseNominatimAddress(address: NominatimResult['address']): AddressFields {
  const calle = [address.road, address.house_number].filter(Boolean).join(' ')
  const localidad =
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.suburb ||
    address.county ||
    ''
  return { direccionDestino: calle, localidad }
}

function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  const prev = useRef<[number, number] | null>(null)
  useEffect(() => {
    if (target && target !== prev.current) {
      prev.current = target
      map.flyTo(target, 16)
    }
  }, [target, map])
  return null
}

function ClickHandler({ onMapClick }: { onMapClick: (coords: Coords) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = (text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${NOMINATIM}/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&countrycodes=ar&limit=5`,
          { headers: NOMINATIM_HEADERS }
        )
        setResults((await res.json()) as NominatimResult[])
      } catch {
        setResults([])
      }
    }, 400)
  }

  const selectResult = (result: NominatimResult) => {
    const coords: Coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
    setFlyTarget([coords.lat, coords.lng])
    setResults([])
    setQuery(result.display_name.split(',')[0])
    onChange(coords, parseNominatimAddress(result.address))
  }

  const handleMapClick = async (coords: Coords) => {
    onChange(coords)
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`,
        { headers: NOMINATIM_HEADERS }
      )
      const data = (await res.json()) as NominatimResult
      if (data.address) {
        setQuery(data.display_name.split(',')[0])
        onChange(coords, parseNominatimAddress(data.address))
      }
    } catch {
      // coords already set, address autocomplete failed silently
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar dirección en el mapa…"
          value={query}
          onChange={(e) => search(e.target.value)}
          autoComplete="off"
        />
        {results.length > 0 && (
          <ul className={styles.dropdown}>
            {results.map((r, i) => (
              <li
                key={i}
                className={styles.dropdownItem}
                onMouseDown={() => selectResult(r)}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapContainer
        center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
        zoom={13}
        className={styles.map}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyTo target={flyTarget} />
        <ClickHandler onMapClick={handleMapClick} />
        {value && (
          <CircleMarker
            center={[value.lat, value.lng]}
            radius={10}
            pathOptions={{ color: '#d44c16', fillColor: '#ef7f32', fillOpacity: 1 }}
          />
        )}
      </MapContainer>

      <p className={styles.hint}>
        {value
          ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} — clic en el mapa para mover el marcador`
          : 'Buscá una dirección o hacé clic en el mapa para confirmar el punto de entrega'}
      </p>
    </div>
  )
}
