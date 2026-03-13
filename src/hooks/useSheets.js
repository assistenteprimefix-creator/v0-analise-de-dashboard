import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCsv, parseDados2026, parseReportsInsights, parsePetTab, parseBedroomRevenue } from '../utils/parseData'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
const CACHE_KEY = 'mr-mouse-dashboard-cache'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const BEDROOM_TABS = ['2 🛏️','3 🛏️','4 🛏️','5 🛏️','6 🛏️','7 🛏️','8 🛏️','9 🛏️','10 🛏️','11 🛏️','12 🛏️']

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, monthly, properties } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return { monthly, properties, ts: new Date(ts) }
  } catch {
    return null
  }
}

function writeCache(monthly, properties) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), monthly, properties }))
  } catch {
    // quota exceeded – silently ignore
  }
}

export function useSheets() {
  const cached = readCache()
  const [monthly, setMonthly] = useState(cached?.monthly ?? [])
  const [properties, setProperties] = useState(cached?.properties ?? [])
  const [loading, setLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(cached?.ts ?? null)
  const isFirstLoad = useRef(!cached)

  const load = useCallback(async (force = false) => {
    // If not forced and cache is still valid, skip the network hit
    if (!force && !isFirstLoad.current) {
      const hit = readCache()
      if (hit) {
        setMonthly(hit.monthly)
        setProperties(hit.properties)
        setLastUpdated(hit.ts)
        return
      }
    }

    try {
      if (isFirstLoad.current) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)

      const [dadosRows, reportsRows, petRows, ...bedroomRows] = await Promise.all([
        fetchCsv('Dados 2026'),
        fetchCsv('Reports e Insights'),
        fetchCsv('PET'),
        ...BEDROOM_TABS.map(t => fetchCsv(t)),
      ])

      const petMap = parsePetTab(petRows)

      const revenueMap = new Map()
      for (const rows of bedroomRows) {
        for (const entry of parseBedroomRevenue(rows)) {
          revenueMap.set(entry.name.toUpperCase(), entry)
        }
      }

      const baseProperties = parseReportsInsights(reportsRows)
      const enriched = baseProperties.map(p => {
        const key = p.name.toUpperCase()
        const pet = petMap.get(key)
        const rev = revenueMap.get(key)
        return {
          ...p,
          isPet: pet === true,
          ytdRental: rev?.ytdRental ?? 0,
          ownerYTD: rev?.ownerYTD ?? 0,
          companyYTD: rev?.companyYTD ?? 0,
          avgMonthlyRental: rev?.avgMonthlyRental ?? 0,
          avgBookings: rev?.avgBookings ?? 0,
        }
      })

      const parsed = parseDados2026(dadosRows)
      setMonthly(parsed)
      setProperties(enriched)
      setLastUpdated(new Date())
      writeCache(parsed, enriched)
    } catch (err) {
      // On network failure, keep stale data if available
      if (!monthly.length) setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFirstLoad.current = false
    }
  }, [monthly.length])

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [load])

  return { monthly, properties, loading, refreshing, error, lastUpdated, refresh: () => load(true) }
}
