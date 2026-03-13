import Papa from 'papaparse'

const SHEET_ID = '1uBNFND_Y-ZdjDNlSI4fn9FXKYrw_pqk11i9x5Asw_6s'

export function sheetCsvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
}

export async function fetchCsv(sheetName) {
  const url = sheetCsvUrl(sheetName) + `&t=${Date.now()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao carregar aba: ${sheetName}`)
  const text = await res.text()
  const { data } = Papa.parse(text, { skipEmptyLines: true })
  return data
}

function parseCurrency(val) {
  if (!val) return 0
  const s = String(val).replace(/[^0-9.,-]/g, '').trim()
  if (!s) return 0
  // Brazilian format: 250.329,00 (dot = thousands, comma = decimal)
  // US format: 250,329.00 (comma = thousands, dot = decimal)
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > lastDot) {
    // Brazilian: remove dots, replace final comma with dot
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
  } else {
    // US: remove commas
    return parseFloat(s.replace(/,/g, '')) || 0
  }
}

function parsePercent(val) {
  if (!val) return 0
  return parseFloat(String(val).replace('%', '').replace(',', '.')) || 0
}

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function parseDados2026(rows) {
  const monthly = []
  for (const row of rows) {
    const month = String(row[0] || '').trim()
    const idx = MONTHS_PT.findIndex(m => m.toLowerCase() === month.toLowerCase())
    if (idx === -1) continue
    monthly.push({
      mes: MONTHS_SHORT[idx],
      mesCompleto: MONTHS_PT[idx],
      bookings: parseInt(row[1]) || 0,
      rental: parseCurrency(row[2]),
      reservationTotal: parseCurrency(row[3]),
      companyRental: parseCurrency(row[4]),
      companyTotal: parseCurrency(row[5]),
      companyProfit: parseCurrency(row[6]),
      owner: parseCurrency(row[7]),
      cleaning: parseCurrency(row[8]),
      poolHeat: parseCurrency(row[9]),
      bookingFee: parseCurrency(row[10]),
      ocupacao: parsePercent(row[11]),
    })
  }
  return monthly
}

// Parse PET tab → Map<upperName → isPet>
export function parsePetTab(rows) {
  const map = new Map()
  for (let i = 1; i < rows.length; i++) {
    const name = String(rows[i][0] || '').trim()
    if (!name) continue
    map.set(name.toUpperCase(), String(rows[i][3] || '').trim().toUpperCase() === 'SIM')
  }
  return map
}

// Parse bedroom tab right-side compact summary (cols index 22-30)
// Row 0 has "Property" header, Row 1+ has per-property data
export function parseBedroomRevenue(rows) {
  const results = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const name = String(row[22] || '').trim()
    if (!name || name === 'Property') continue
    results.push({
      name,
      avgBookings: parseFloat(String(row[23] || '').replace(',', '.')) || 0,
      avgMonthlyRental: parseCurrency(row[24]),
      ytdRental: parseCurrency(row[25]),
      avgCleaning: parseCurrency(row[26]),
      ownerYTD: parseCurrency(row[27]),
      poolHeatYTD: parseCurrency(row[28]),
      companyYTD: parseCurrency(row[29]),
    })
  }
  return results
}

export function parseReportsInsights(rows) {
  if (!rows.length) return []
  const header = rows[0]
  const properties = []

  // Single pass over header to build column index map
  const colMap = { occCols: [] }
  for (let j = 0; j < header.length; j++) {
    const h = String(header[j] || '').trim()
    const hLow = h.toLowerCase()
    const hUp = h.toUpperCase()

    const matchOcc = h.match(/TX Ocupa[çc]ão\s*\((\w+)\)/i)
    if (matchOcc) {
      colMap.occCols.push({ j, month: matchOcc[1].toUpperCase() })
      continue
    }
    if (hUp === 'MIN') { colMap.minPrice = j; continue }
    if (hUp === 'BASE') { colMap.basePrice = j; continue }
    if (hUp === 'MAX') { colMap.maxPrice = j; continue }
    if (hLow.includes('avalia') && hLow.includes('airbnb')) { colMap.rating = j; continue }
    if (hLow.includes('guest') && hLow.includes('favorite')) { colMap.guestFavorite = j; continue }
    if (hLow.includes('evento')) { colMap.eventos = j; continue }
    if (hLow === 'ação' || hLow === 'acao' || hLow === 'aã§ã£o') { colMap.acao = j; continue }
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const name = String(row[0] || '').trim()
    if (!name || name.toLowerCase() === 'propriedades') continue

    const occupancyData = {}
    for (const { j, month } of colMap.occCols) {
      occupancyData[month] = parsePercent(row[j])
    }

    const avgOcc = colMap.occCols.length
      ? colMap.occCols.reduce((s, { month }) => s + (occupancyData[month] || 0), 0) / colMap.occCols.length
      : 0

    properties.push({
      name,
      bedrooms: parseInt(row[1]) || 0,
      condominium: String(row[2] || '').trim(),
      propertyId: String(row[3] || '').trim(),
      idRU: String(row[4] || '').trim(),
      occupancy: occupancyData,
      avgOccupancy: Math.round(avgOcc),
      rating: colMap.rating != null ? parseFloat(String(row[colMap.rating]).replace(',', '.')) || 0 : 0,
      guestFavorite: colMap.guestFavorite != null ? String(row[colMap.guestFavorite]).trim().toUpperCase() === 'SIM' : false,
      eventos: colMap.eventos != null ? String(row[colMap.eventos] || '').trim() : '',
      acao: colMap.acao != null ? String(row[colMap.acao] || '').trim() : '',
      minPrice: colMap.minPrice != null ? parseCurrency(row[colMap.minPrice]) : 0,
      basePrice: colMap.basePrice != null ? parseCurrency(row[colMap.basePrice]) : 0,
      maxPrice: colMap.maxPrice != null ? parseCurrency(row[colMap.maxPrice]) : 0,
    })
  }
  return properties
}
