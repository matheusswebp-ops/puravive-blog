import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ViewsChart from "@/components/admin/ViewsChart";
import { getMetrics, type PeriodDays } from "@/lib/metrics";

const PERIODS: { days: PeriodDays; label: string }[] = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

const nf = new Intl.NumberFormat("pt-BR");

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? null : { up: true, text: "novo" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { up: true, text: "estável" };
  return { up: pct > 0, text: `${pct > 0 ? "+" : ""}${pct}%` };
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const days: PeriodDays =
    PERIODS.find((p) => String(p.days) === dias)?.days ?? 30;

  const m = await getMetrics(days);
  const variation = trend(m.views, m.previousViews);
  const perDayAverage = m.views === 0 ? 0 : Math.round(m.views / days);
  const topPostViews = m.topPosts[0]?.views ?? 0;
  const totalDevices = m.devices.mobile + m.devices.desktop;
  const mobileShare =
    totalDevices === 0
      ? 0
      : Math.round((m.devices.mobile / totalDevices) * 100);
  const topReferrer = m.referrers[0]?.views ?? 0;
  const topOtherPage = m.otherPages[0]?.views ?? 0;

  return (
    <>
      <AdminHeader />
      <div className="admin-content admin-content-wide">
        <div className="admin-content-head">
          <h1>Métricas</h1>
          <nav className="admin-tabs admin-tabs-inline">
            {PERIODS.map((p) => (
              <Link
                key={p.days}
                href={`/admin/metricas?dias=${p.days}`}
                className={`admin-tab${p.days === days ? " admin-tab-active" : ""}`}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </div>

        {!m.available ? (
          <div className="metric-setup">
            <h2>Falta criar a tabela de visitas</h2>
            <p>
              As métricas ficam no seu próprio Supabase — nenhum serviço de
              terceiro, nenhum dado saindo daqui. Só falta criar a tabela uma
              vez:
            </p>
            <ol>
              <li>
                Abra o <strong>SQL Editor</strong> do seu projeto no Supabase.
              </li>
              <li>
                Cole o conteúdo do arquivo <code>supabase/metricas.sql</code>{" "}
                (está na raiz do projeto) e rode.
              </li>
              <li>Recarregue esta página.</li>
            </ol>
            <p className="metric-setup-note">
              A contagem começa do zero a partir daí — não dá pra recuperar
              visitas de antes da tabela existir.
            </p>
          </div>
        ) : (
          <>
            <div className="metric-tiles">
              <div className="metric-tile">
                <span className="metric-label">Visitas</span>
                <strong className="metric-value">{nf.format(m.views)}</strong>
                {variation && (
                  <span
                    className={`metric-trend${variation.up ? "" : " metric-trend-down"}`}
                  >
                    {variation.text} vs. {days} dias anteriores
                  </span>
                )}
              </div>
              <div className="metric-tile">
                <span className="metric-label">Visitantes únicos</span>
                <strong className="metric-value">{nf.format(m.visitors)}</strong>
                <span className="metric-trend metric-trend-muted">
                  pessoas diferentes
                </span>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Média por dia</span>
                <strong className="metric-value">
                  {nf.format(perDayAverage)}
                </strong>
                <span className="metric-trend metric-trend-muted">
                  visitas/dia
                </span>
              </div>
              <div className="metric-tile">
                <span className="metric-label">No celular</span>
                <strong className="metric-value">
                  {totalDevices === 0 ? "—" : `${mobileShare}%`}
                </strong>
                {totalDevices === 0 ? (
                  <span className="metric-trend metric-trend-muted">
                    do total de visitas
                  </span>
                ) : (
                  <>
                    <div className="device-split" aria-hidden="true">
                      <span
                        className="device-mobile"
                        style={{ width: `${mobileShare}%` }}
                      />
                      <span
                        className="device-desktop"
                        style={{ width: `${100 - mobileShare}%` }}
                      />
                    </div>
                    <div className="device-legend">
                      <span>
                        <i style={{ background: "var(--brand)" }} />
                        Celular {nf.format(m.devices.mobile)}
                      </span>
                      <span>
                        <i style={{ background: "var(--chart-neutral)" }} />
                        Computador {nf.format(m.devices.desktop)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <section className="metric-card">
              <div className="metric-card-head">
                <h2>Visitas por dia</h2>
                <span className="metric-card-hint">
                  passe o mouse no gráfico pra ver cada dia
                </span>
              </div>
              {m.views === 0 ? (
                <p className="admin-empty">
                  Nenhuma visita registrada neste período ainda.
                </p>
              ) : (
                <ViewsChart data={m.perDay} />
              )}
            </section>

            <section className="metric-card">
              <div className="metric-card-head">
                <h2>Posts mais lidos</h2>
              </div>
              {m.topPosts.length === 0 ? (
                <p className="admin-empty">
                  Nenhum post recebeu visita neste período.
                </p>
              ) : (
                <div className="metric-rank">
                  {m.topPosts.map((post) => (
                    <div key={post.postId} className="metric-rank-row">
                      <Link
                        href={`/admin/posts/${post.postId}`}
                        className="metric-rank-title"
                      >
                        {post.title}
                      </Link>
                      <div className="metric-rank-bar-track">
                        <div
                          className="metric-rank-bar"
                          style={{
                            width: `${topPostViews === 0 ? 0 : (post.views / topPostViews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="metric-rank-value">
                        {nf.format(post.views)}
                        <em>{nf.format(post.visitors)} pessoas</em>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="metric-split">
              <section className="metric-card">
                <div className="metric-card-head">
                  <h2>De onde vieram</h2>
                </div>
                {m.referrers.length === 0 ? (
                  <p className="admin-empty">
                    Todo mundo chegou direto, sem link de origem.
                  </p>
                ) : (
                  <ul className="metric-list">
                    {m.referrers.map((r) => (
                      <li key={r.host}>
                        <span className="metric-list-name">{r.host}</span>
                        <span className="metric-list-track">
                          <span
                            className="metric-list-fill"
                            style={{
                              width: `${topReferrer === 0 ? 0 : (r.views / topReferrer) * 100}%`,
                            }}
                          />
                        </span>
                        <strong>{nf.format(r.views)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="metric-card">
                <div className="metric-card-head">
                  <h2>Outras páginas</h2>
                </div>
                {m.otherPages.length === 0 ? (
                  <p className="admin-empty">Sem visitas fora dos posts.</p>
                ) : (
                  <ul className="metric-list">
                    {m.otherPages.map((p) => (
                      <li key={p.path}>
                        <span className="metric-list-name">
                          {p.path === "/" ? "/ (home)" : p.path}
                        </span>
                        <span className="metric-list-track">
                          <span
                            className="metric-list-fill"
                            style={{
                              width: `${topOtherPage === 0 ? 0 : (p.views / topOtherPage) * 100}%`,
                            }}
                          />
                        </span>
                        <strong>{nf.format(p.views)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {m.truncated && (
              <p className="metric-setup-note">
                Volume alto: a tela está lendo as visitas mais recentes até o
                limite de 20 mil registros, então os totais deste período podem
                estar subestimados.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
