import type { DayPoint } from "@/lib/metrics";

const W = 720;
const H = 220;
const PAD_LEFT = 38;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;
const MAX_BAR = 24;
const GAP = 2;

// Topo do eixo num número redondo (10, 20, 50, 100...) pra régua ficar legível.
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

export default function ViewsChart({ data }: { data: DayPoint[] }) {
  const plotW = W - PAD_LEFT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const peak = Math.max(...data.map((d) => d.views), 0);
  const top = niceMax(peak);
  const band = plotW / data.length;
  const barW = Math.max(2, Math.min(MAX_BAR, band - GAP));
  const peakIndex = data.findIndex((d) => d.views === peak);

  // Com 30 ou 90 dias, uma data por coluna vira ruído: ~6 marcas bastam.
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <figure className="chart-figure">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={`Visitas por dia. Pico de ${peak} visitas.`}
      >
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + plotH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={W}
                y1={y}
                y2={y}
                className="chart-grid"
              />
              <text x={PAD_LEFT - 8} y={y + 4} className="chart-axis-label">
                {Math.round(top * t)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const h = top === 0 ? 0 : (d.views / top) * plotH;
          const x = PAD_LEFT + band * i + (band - barW) / 2;
          const y = PAD_TOP + plotH - h;

          return (
            <g key={d.date} className="chart-col">
              {/* alvo de hover mais largo que a barra */}
              <rect
                x={PAD_LEFT + band * i}
                y={PAD_TOP}
                width={band}
                height={plotH}
                className="chart-hit"
              >
                <title>{`${d.label} · ${d.views} ${d.views === 1 ? "visita" : "visitas"}`}</title>
              </rect>
              {h > 0 && (
                <path d={barPath(x, y, barW, h)} className="chart-bar" />
              )}
              {i === peakIndex && peak > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  className="chart-value-label"
                  textAnchor="middle"
                >
                  {peak}
                </text>
              )}
              {i % labelEvery === 0 && (
                <text
                  x={x + barW / 2}
                  y={H - 6}
                  className="chart-axis-label"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
