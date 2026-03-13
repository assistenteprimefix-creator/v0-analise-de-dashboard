export function getTooltipStyle() {
  return {
    contentStyle: {
      background: 'var(--tooltip-bg)',
      border: '1px solid var(--tooltip-border)',
      borderRadius: 12,
      color: 'var(--tooltip-text)',
      fontSize: 12,
    },
    itemStyle: { color: 'var(--tooltip-item)' },
    labelStyle: { color: 'var(--tooltip-label)', fontWeight: 600 },
    cursor: { fill: 'var(--chart-cursor)' },
  }
}

export const GRID_COLOR = 'var(--chart-grid)'
export const TICK_COLOR = 'var(--chart-tick)'
