import type { DayPoint } from "@/lib/metrics";

const W = 760;
const H = 260;
const PAD_LEFT = 40;
// folga à direita pro ponto final e seu anel não serem cortados
const PAD_RIGHT = 10;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const MAX_BAR = 24;
const GAP = 2;
// Acima disso uma coluna por dia vira pente; a série vira linha com área.
const COLUMN_LIMIT = 14;

// Degraus finos: com pico 67 o topo vira 80, não 100 — sem um terço do
// gráfico vazio. Todos os degraus dividem por 2 pra régua do meio ser inteira.
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

// Cantos arredondados só no topo: a barra nasce quadrada na linha de base.
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

export default function ViewsChart({ data }: { data: DayPoint[] }) {
  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const baseline = PAD_TOP + plotH;
  const peak = Math.max(...data.map((d) => d.views), 0);
  const top = niceMax(peak);
  const peakIndex = data.findIndex((d) => d.views === peak);
  const asColumns = data.length <= COLUMN_LIMIT;

  const band = plotW / data.length;
  const barW = Math.max(2, Math.min(MAX_BAR, band - GAP));
  const x = (i: number) =>
    asColumns
      ? PAD_LEFT + band * i + band / 2
      : PAD_LEFT + (data.length === 1 ? plotW / 2 : (plotW * i) / (data.length - 1));
  const y = (v: number) => PAD_TOP + plotH - (top === 0 ? 0 : (v / top) * plotH);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.views)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1)},${baseline} L${x(0)},${baseline} Z`;

  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const lastIndex = data.length - 1;

  return (
    <figure className="chart-figure">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={`Visitas por dia nos últimos ${data.length} dias. Pico de ${peak} visitas.`}
      >
        {[0, 0.5, 1].map((t) => {
          const gy = PAD_TOP + plotH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={W - PAD_RIGHT}
                y1={gy}
                y2={gy}
                className="chart-grid"
              />
              <text x={PAD_LEFT - 10} y={gy + 4} className="chart-axis-label" textAnchor="end">
                {Math.round(top * t)}
              </text>
            </g>
          );
        })}

        {asColumns
          ? data.map((d, i) =>
              d.views > 0 ? (
                <path
                  key={d.date}
                  d={barPath(x(i) - barW / 2, y(d.views), barW, baseline - y(d.views))}
                  className="chart-bar"
                />
              ) : null
            )
          : peak > 0 && (
              <>
                <path d={areaPath} className="chart-area" />
                <path d={linePath} className="chart-line" />
                <circle cx={x(lastIndex)} cy={y(data[lastIndex].views)} r={4.5} className="chart-end-dot" />
              </>
            )}

        {peak > 0 && (
          <text
            x={Math.min(Math.max(x(peakIndex), PAD_LEFT + 12), W - 12)}
            y={y(peak) - 12}
            className="chart-value-label"
            textAnchor="middle"
          >
            {peak}
          </text>
        )}

        {data.map((d, i) => {
          if (i % labelEvery !== 0) return null;
          return (
            <text key={`l${d.date}`} x={x(i)} y={H - 8} className="chart-axis-label" textAnchor="middle">
              {d.label}
            </text>
          );
        })}

        {/* camada de hover: alvo largo por dia, com fio-guia e balão */}
        {data.map((d, i) => {
          const px = x(i);
          const py = y(d.views);
          const text = `${d.views} ${d.views === 1 ? "visita" : "visitas"}`;
          const tipW = Math.max(84, Math.max(d.label.length, text.length) * 6.6 + 20);
          const tipH = 40;
          const tipX = Math.min(Math.max(px - tipW / 2, 2), W - tipW - 2);
          const above = py - tipH - 14 > 0;
          const tipY = above ? py - tipH - 14 : py + 14;

          return (
            <g key={`h${d.date}`} className="chart-hover">
              <rect
                x={asColumns ? PAD_LEFT + band * i : px - plotW / data.length / 2}
                y={PAD_TOP}
                width={asColumns ? band : plotW / data.length}
                height={plotH}
                className="chart-hit"
              />
              <g className="chart-tip">
                <line x1={px} x2={px} y1={PAD_TOP} y2={baseline} className="chart-crosshair" />
                <circle cx={px} cy={py} r={5} className="chart-dot" />
                <g transform={`translate(${tipX},${tipY})`}>
                  <rect width={tipW} height={tipH} rx={8} className="chart-tip-box" />
                  <text x={10} y={16} className="chart-tip-label">
                    {d.label}
                  </text>
                  <text x={10} y={31} className="chart-tip-value">
                    {text}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      <details className="chart-table">
        <summary>Ver os números</summary>
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Visitas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{d.label}</td>
                <td>{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
