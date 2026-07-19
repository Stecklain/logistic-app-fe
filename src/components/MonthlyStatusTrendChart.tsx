import { useMemo, useState } from 'react'
import styles from './MonthlyStatusTrendChart.module.css'

export interface MonthlyStatusTrendPoint {
  mes: string
  entregados: number
  cancelados: number
}

interface Props {
  data: MonthlyStatusTrendPoint[]
}

const COLOR_ENTREGADOS = '#0ca30c'
const COLOR_CANCELADOS = '#d03b3b'

const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function formatMes(mes: string) {
  const [anio, mesNum] = mes.split('-')
  const index = Number(mesNum) - 1
  return `${MESES_CORTOS[index] ?? mes} '${anio.slice(2)}`
}

function niceMax(value: number) {
  if (value <= 0) return 4
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude
  let niceNormalized = 10
  if (normalized <= 1) niceNormalized = 1
  else if (normalized <= 2) niceNormalized = 2
  else if (normalized <= 5) niceNormalized = 5
  return niceNormalized * magnitude
}

const WIDTH = 680
const HEIGHT = 260
const MARGIN = { top: 16, right: 40, bottom: 36, left: 36 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom

export default function MonthlyStatusTrendChart({ data }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const maxY = useMemo(() => {
    const max = data.reduce(
      (acc, point) => Math.max(acc, point.entregados, point.cancelados),
      0
    )
    return niceMax(max)
  }, [data])

  if (data.length === 0) {
    return (
      <p className={styles.empty}>
        Todavía no hay pedidos entregados o cancelados para graficar.
      </p>
    )
  }

  const xFor = (index: number) =>
    data.length > 1
      ? MARGIN.left + (index / (data.length - 1)) * PLOT_WIDTH
      : MARGIN.left + PLOT_WIDTH / 2
  const yFor = (value: number) => MARGIN.top + PLOT_HEIGHT - (value / maxY) * PLOT_HEIGHT

  const entregadosPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.entregados)}`)
    .join(' ')
  const canceladosPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.cancelados)}`)
    .join(' ')

  const yTicks = [0, maxY / 4, maxY / 2, (maxY * 3) / 4, maxY]
  const bandWidth = data.length > 1 ? PLOT_WIDTH / (data.length - 1) : PLOT_WIDTH
  const last = data[data.length - 1]
  const hovered = hoverIndex != null ? data[hoverIndex] : null

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: COLOR_ENTREGADOS }} />
            Entregados
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: COLOR_CANCELADOS }} />
            Cancelados
          </span>
        </div>

        <button
          type="button"
          className={styles.tableToggle}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'Ver gráfico' : 'Ver como tabla'}
        </button>
      </div>

      {showTable ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Entregados</th>
              <th>Cancelados</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.mes}>
                <td>{formatMes(point.mes)}</td>
                <td>{point.entregados}</td>
                <td>{point.cancelados}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.chartArea}>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className={styles.svg}
            role="img"
            aria-label="Pedidos entregados vs cancelados por mes"
          >
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  className={styles.gridline}
                />
                <text
                  x={MARGIN.left - 8}
                  y={yFor(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className={styles.tickLabel}
                >
                  {Math.round(tick)}
                </text>
              </g>
            ))}

            {data.map((point, index) => (
              <text
                key={point.mes}
                x={xFor(index)}
                y={HEIGHT - MARGIN.bottom + 20}
                textAnchor="middle"
                className={styles.tickLabel}
              >
                {formatMes(point.mes)}
              </text>
            ))}

            <path
              d={canceladosPath}
              fill="none"
              stroke={COLOR_CANCELADOS}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={entregadosPath}
              fill="none"
              stroke={COLOR_ENTREGADOS}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx={xFor(data.length - 1)}
              cy={yFor(last.cancelados)}
              r={4}
              fill={COLOR_CANCELADOS}
              stroke="#fcfcfb"
              strokeWidth={2}
            />
            <circle
              cx={xFor(data.length - 1)}
              cy={yFor(last.entregados)}
              r={4}
              fill={COLOR_ENTREGADOS}
              stroke="#fcfcfb"
              strokeWidth={2}
            />

            <text
              x={xFor(data.length - 1) + 8}
              y={yFor(last.entregados)}
              className={styles.endLabel}
              dominantBaseline="middle"
            >
              {last.entregados}
            </text>
            <text
              x={xFor(data.length - 1) + 8}
              y={yFor(last.cancelados)}
              className={styles.endLabel}
              dominantBaseline="middle"
            >
              {last.cancelados}
            </text>

            {hoverIndex != null ? (
              <line
                x1={xFor(hoverIndex)}
                x2={xFor(hoverIndex)}
                y1={MARGIN.top}
                y2={HEIGHT - MARGIN.bottom}
                className={styles.crosshair}
              />
            ) : null}

            {data.map((point, index) => (
              <rect
                key={point.mes}
                x={xFor(index) - bandWidth / 2}
                y={MARGIN.top}
                width={bandWidth}
                height={PLOT_HEIGHT}
                className={styles.hitArea}
                onPointerEnter={() => setHoverIndex(index)}
                onPointerLeave={() => setHoverIndex(null)}
              />
            ))}
          </svg>

          {hovered ? (
            <div
              className={styles.tooltip}
              style={{ left: `${(xFor(hoverIndex!) / WIDTH) * 100}%` }}
            >
              <strong>{formatMes(hovered.mes)}</strong>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipKey} style={{ background: COLOR_ENTREGADOS }} />
                Entregados: <b>{hovered.entregados}</b>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipKey} style={{ background: COLOR_CANCELADOS }} />
                Cancelados: <b>{hovered.cancelados}</b>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
