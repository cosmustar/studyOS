// Utilitários de data. Usamos a data LOCAL (não UTC) para que "hoje" seja o seu dia.

export const DAY_MS = 24 * 60 * 60 * 1000

/** "2026-11-23" a partir de uma data, no fuso local. */
export function dayKey(date = new Date()) {
  const d = new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Os 7 dias da semana atual (segunda a domingo). */
export function currentWeek(today = new Date()) {
  const d = new Date(today)
  d.setHours(0, 0, 0, 0)
  const offset = (d.getDay() + 6) % 7 // segunda = 0
  const monday = new Date(d.getTime() - offset * DAY_MS)
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY_MS))
}

export function formatMinutes(totalMinutes) {
  const m = Math.round(totalMinutes)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h}h ${rest}min` : `${h}h`
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Math.abs(seconds)))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function relativeDay(iso) {
  const diff = Math.round((new Date(dayKey()) - new Date(dayKey(iso))) / DAY_MS)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return `há ${diff} dias`
}
