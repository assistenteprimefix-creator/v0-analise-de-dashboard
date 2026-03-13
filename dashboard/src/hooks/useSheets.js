import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCsv, parseDados2026, parseReportsInsights, parsePetTab, parseBedroomRevenue } from '../utils/parseData'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

const BEDROOM_TABS = ['2 🛏️','3 🛏️','4 🛏️','5 🛏️','6 🛏️','7 🛏️','8 🛏️','9 🛏️','10 🛏️','11 🛏️','12 🛏️']

export function useSheets() {
  const [monthly, setMonthly] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const isFirstLoad = useRef(true)

  const load = useCallback(async () => {
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

      // Build lookup maps from supplemental tabs
      const petMap = parsePetTab(petRows)

      const revenueMap = new Map()
      for (const rows of bedroomRows) {
        for (const entry of parseBedroomRevenue(rows)) {
          revenueMap.set(entry.name.toUpperCase(), entry)
        }
      }

      // Merge all enrichment data into properties
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

      setMonthly(parseDados2026(dadosRows))
      setProperties(enriched)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFirstLoad.current = false
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [load])

  return { monthly, properties, loading, refreshing, error, lastUpdated, refresh: load }
}
