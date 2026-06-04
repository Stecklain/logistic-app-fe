import type { TrackingResponse } from '../types/domain'
import { apiFetch } from './api'

export async function getTrackingByCode(code: string) {
  return apiFetch<TrackingResponse>(`/api/tracking/${encodeURIComponent(code)}`)
}
