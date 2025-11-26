"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../_components/header";
import Footer from "../_components/footer";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import type {
  MapContainerProps,
  TileLayerProps,
  CircleMarkerProps,
  TooltipProps as LeafletTooltipProps,
} from "react-leaflet";

// --- Leaflet (mapa lateral) ---
const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);

const CircleMarker = dynamic<CircleMarkerProps>(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
);

const LeafletTooltip = dynamic<LeafletTooltipProps>(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false },
);

// Componente para mover o mapa quando o centro/zoom mudarem
type MapUpdaterProps = {
  center: [number, number];
  zoom: number;
};

const MapUpdater = dynamic<MapUpdaterProps>(
  () =>
    import("react-leaflet").then((m) => {
      const Inner = ({ center, zoom }: MapUpdaterProps) => {
        const map = m.useMap();
        useEffect(() => {
          map.setView(center, zoom);
        }, [center, zoom, map]);
        return null;
      };
      return Inner;
    }),
  { ssr: false },
);

type SerieAnualItem = {
  ano: number;
  total: number;
};

type SerieMensalItem = {
  mes: number;
  anoSelecionado: number;
  anoAnterior: number;
};

type SerieMensalResponse = {
  anoSelecionado: number;
  anoAnterior: number;
  meses: SerieMensalItem[];
};

type Foco = {
  id: string;
  lat: string;
  lon: string;
  city: string | null;
  data: string;
  biome: string | null;
};

const mesesLabels: { value: number; label: string }[] = [
  { value: 0, label: "Todos os meses" },
  { value: 1, label: "Jan" },
  { value: 2, label: "Fev" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Set" },
  { value: 10, label: "Out" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dez" },
];

const TODOS_MUNICIPIOS_VALUE = "__all__";

const SerieHistoricaPage = () => {
  const [serieAnual, setSerieAnual] = useState<SerieAnualItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [serieMensal, setSerieMensal] = useState<SerieMensalItem[]>([]);
  const [anoMensalSelecionado, setAnoMensalSelecionado] = useState<
    number | null
  >(null);
  const [anoMensalAnterior, setAnoMensalAnterior] = useState<number | null>(
    null,
  );

  const [loadingAnual, setLoadingAnual] = useState(false);
  const [loadingMensal, setLoadingMensal] = useState(false);
  const [errorAnual, setErrorAnual] = useState<string | null>(null);
  const [errorMensal, setErrorMensal] = useState<string | null>(null);

  // Filtros adicionais
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string>(
    TODOS_MUNICIPIOS_VALUE,
  );
  const [mesFiltro, setMesFiltro] = useState<number>(0); // 0 = todos os meses

  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [errorMunicipios, setErrorMunicipios] = useState<string | null>(null);

  // Dados para o mapa
  const [focosMapa, setFocosMapa] = useState<Foco[]>([]);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(null);

  // --- Carrega municípios (para o filtro) ---
  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        setLoadingMunicipios(true);
        setErrorMunicipios(null);

        const res = await fetch("/api/queimadas/municipios");
        if (!res.ok) {
          throw new Error("Erro ao buscar lista de municípios.");
        }

        const json = (await res.json()) as { cities: string[] };
        setMunicipios(json.cities ?? []);
      } catch (error: unknown) {
        console.error(error);
        setErrorMunicipios(
          error instanceof Error
            ? error.message
            : "Erro ao carregar municípios.",
        );
      } finally {
        setLoadingMunicipios(false);
      }
    };

    void fetchMunicipios();
  }, []);

  // --- Carrega série anual (por estado ou município) ---
  useEffect(() => {
    const fetchSerieAnual = async () => {
      try {
        setLoadingAnual(true);
        setErrorAnual(null);

        const params = new URLSearchParams();
        if (municipioSelecionado !== TODOS_MUNICIPIOS_VALUE) {
          params.set("city", municipioSelecionado);
        }

        const url =
          params.toString().length > 0
            ? `/api/queimadas/serie-historica?${params.toString()}`
            : "/api/queimadas/serie-historica";

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Erro ao buscar série histórica anual.");
        }

        const json = (await res.json()) as { serie: SerieAnualItem[] };

        const ordenada = [...json.serie].sort((a, b) => a.ano - b.ano);
        setSerieAnual(ordenada);

        if (ordenada.length > 0) {
          const ultimoAno = ordenada[ordenada.length - 1].ano;
          setSelectedYear((prev) => prev ?? ultimoAno);
        } else {
          setSelectedYear(null);
        }
      } catch (error: unknown) {
        console.error(error);
        setErrorAnual(
          error instanceof Error
            ? error.message
            : "Erro ao carregar série histórica anual.",
        );
        setSerieAnual([]);
        setSelectedYear(null);
      } finally {
        setLoadingAnual(false);
      }
    };

    void fetchSerieAnual();
  }, [municipioSelecionado]);

  // --- Carrega série mensal (ano selecionado x ano anterior), filtrada por município ---
  useEffect(() => {
    const fetchSerieMensal = async () => {
      if (!selectedYear) return;

      try {
        setLoadingMensal(true);
        setErrorMensal(null);

        const params = new URLSearchParams({ ano: String(selectedYear) });
        if (municipioSelecionado !== TODOS_MUNICIPIOS_VALUE) {
          params.set("city", municipioSelecionado);
        }

        const url = `/api/queimadas/serie-historica/mensal?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Erro ao buscar série histórica mensal.");
        }

        const json = (await res.json()) as SerieMensalResponse;

        setSerieMensal(json.meses);
        setAnoMensalSelecionado(json.anoSelecionado);
        setAnoMensalAnterior(json.anoAnterior);
      } catch (error: unknown) {
        console.error(error);
        setErrorMensal(
          error instanceof Error
            ? error.message
            : "Erro ao carregar série histórica mensal.",
        );
        setSerieMensal([]);
        setAnoMensalSelecionado(null);
        setAnoMensalAnterior(null);
      } finally {
        setLoadingMensal(false);
      }
    };

    void fetchSerieMensal();
  }, [selectedYear, municipioSelecionado]);

  // --- Carrega focos para o mapa lateral (ano + mês + município) ---
  useEffect(() => {
    const fetchFocosMapa = async () => {
      if (!selectedYear) return;

      try {
        setLoadingMapa(true);
        setErrorMapa(null);

        const params = new URLSearchParams({
          ano: String(selectedYear),
          mes: String(mesFiltro),
        });

        if (municipioSelecionado !== TODOS_MUNICIPIOS_VALUE) {
          params.set("city", municipioSelecionado);
        }

        const url = `/api/queimadas?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Erro ao carregar focos para o mapa.");
        }

        const json = (await res.json()) as { focos: Foco[] };
        setFocosMapa(json.focos ?? []);
      } catch (error: unknown) {
        console.error(error);
        setErrorMapa(
          error instanceof Error
            ? error.message
            : "Erro ao carregar focos do mapa.",
        );
        setFocosMapa([]);
      } finally {
        setLoadingMapa(false);
      }
    };

    void fetchFocosMapa();
  }, [selectedYear, mesFiltro, municipioSelecionado]);

  const anosDisponiveis = useMemo(
    () => serieAnual.map((item) => item.ano),
    [serieAnual],
  );

  const dadosMensaisChart = useMemo(() => {
    return serieMensal.map((m) => ({
      mes: m.mes,
      anoSelecionado: m.anoSelecionado,
      anoAnterior: m.anoAnterior,
    }));
  }, [serieMensal]);

  // Total de focos no ano selecionado (para o texto abaixo do gráfico de barras)
  const totalAnoSelecionado = useMemo(() => {
    if (!selectedYear) return null;
    const item = serieAnual.find((s) => s.ano === selectedYear);
    return item?.total ?? null;
  }, [serieAnual, selectedYear]);

  // Centro do mapa a partir dos focos
  const mapaCenter = useMemo<[number, number]>(() => {
    if (focosMapa.length === 0) {
      return [-16.6, -49.3]; // centro padrão de Goiás
    }

    let somaLat = 0;
    let somaLon = 0;
    let count = 0;

    for (const f of focosMapa) {
      const lat = parseFloat(f.lat);
      const lon = parseFloat(f.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
      somaLat += lat;
      somaLon += lon;
      count += 1;
    }

    if (count === 0) {
      return [-16.6, -49.3];
    }

    return [somaLat / count, somaLon / count];
  }, [focosMapa]);

  const mapaZoom = useMemo(() => {
    if (
      municipioSelecionado === TODOS_MUNICIPIOS_VALUE ||
      focosMapa.length === 0
    ) {
      return 6;
    }
    return 8;
  }, [municipioSelecionado, focosMapa.length]);

  const labelMunicipioAtual =
    municipioSelecionado === TODOS_MUNICIPIOS_VALUE
      ? "Todos os municípios"
      : municipioSelecionado;

  const labelMesAtual =
    mesesLabels.find((m) => m.value === mesFiltro)?.label ?? "Todos os meses";

  // Estatísticas do recorte do mapa: total de focos e "dias sem foco"
  const statsMapa = useMemo(() => {
    if (!selectedYear) return null;

    const ano = selectedYear;
    const mes = mesFiltro;

    const inicio = mes === 0 ? new Date(ano, 0, 1) : new Date(ano, mes - 1, 1);
    const fim = mes === 0 ? new Date(ano + 1, 0, 1) : new Date(ano, mes, 1);

    const diffMs = fim.getTime() - inicio.getTime();
    const diasPeriodo = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const diasComFoco = new Set<string>();

    for (const f of focosMapa) {
      const d = new Date(f.data);
      if (d >= inicio && d < fim) {
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        diasComFoco.add(key);
      }
    }

    const totalFocos = focosMapa.length;
    const diasComFocoCount = diasComFoco.size;
    const diasSemFoco = Math.max(diasPeriodo - diasComFocoCount, 0);

    return {
      totalFocos,
      diasPeriodo,
      diasComFoco: diasComFocoCount,
      diasSemFoco,
    };
  }, [selectedYear, mesFiltro, focosMapa]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-semibold">
          Série histórica de queimadas em Goiás
        </h1>
        <p className="mb-4 max-w-3xl text-sm text-slate-400">
          Nesta página é possível acompanhar a evolução anual e mensal dos focos
          de queimadas em Goiás, com possibilidade de filtrar por município e
          mês, além de visualizar a localização dos focos em mapa interativo.
        </p>

        {/* Filtros principais */}
        <div className="mb-5 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          {/* Ano */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ano"
              className="text-xs font-semibold text-slate-300"
            >
              Ano para comparação mensal
            </label>
            <select
              id="ano"
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
              disabled={anosDisponiveis.length === 0}
            >
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          {/* Município */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="municipio"
              className="text-xs font-semibold text-slate-300"
            >
              Município
            </label>
            <select
              id="municipio"
              value={municipioSelecionado}
              onChange={(e) => setMunicipioSelecionado(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
              disabled={loadingMunicipios}
            >
              <option value={TODOS_MUNICIPIOS_VALUE}>
                Todos os municípios
              </option>
              {loadingMunicipios && (
                <option value="">Carregando municípios...</option>
              )}
              {!loadingMunicipios &&
                municipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
            {errorMunicipios && (
              <p className="text-[11px] text-red-400">{errorMunicipios}</p>
            )}
          </div>

          {/* Mês */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="mes"
              className="text-xs font-semibold text-slate-300"
            >
              Mês (para o mapa)
            </label>
            <select
              id="mes"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
            >
              {mesesLabels.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end text-xs text-slate-500">
            <span>
              {loadingAnual
                ? "Carregando séries..."
                : anosDisponiveis.length > 0
                  ? `Anos disponíveis: ${anosDisponiveis[0]}–${
                      anosDisponiveis[anosDisponiveis.length - 1]
                    }`
                  : "Nenhum ano disponível"}
            </span>
            <span>
              Contexto: {labelMunicipioAtual} · {labelMesAtual} · Ano{" "}
              {selectedYear ?? "—"}
            </span>
          </div>
        </div>

        {/* Grid principal: Gráficos à esquerda, mapa à direita */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Coluna esquerda: gráficos */}
          <div className="space-y-8">
            {/* Gráfico de barras - série anual */}
            <section>
              <h2 className="mb-2 text-xl font-semibold">
                Total de focos por ano
              </h2>
              <p className="mb-3 max-w-2xl text-xs text-slate-400">
                Cada barra representa o total de focos de queimadas registrados
                no ano, considerando o município e o recorte geográfico
                selecionado. Clique em um ano para utilizá-lo como referência na
                comparação mensal abaixo.
              </p>

              <div className="h-72 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                {errorAnual && (
                  <p className="mb-2 text-xs text-red-400">{errorAnual}</p>
                )}

                {!errorAnual && !loadingAnual && serieAnual.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Nenhum dado encontrado para a série anual.
                  </p>
                )}

                {serieAnual.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serieAnual}
                      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="ano"
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        formatter={(value) => {
                          const num =
                            typeof value === "number" ? value : Number(value);
                          return [
                            num.toLocaleString("pt-BR"),
                            "Total de focos",
                          ];
                        }}
                        labelFormatter={(label: string | number) =>
                          `Ano ${label.toString()}`
                        }
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid #1f2937",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          color: "#e5e7eb",
                        }}
                      />
                      <Bar dataKey="total" name="Total de focos">
                        {serieAnual.map((item) => (
                          <Cell
                            key={item.ano}
                            cursor="pointer"
                            onClick={() => setSelectedYear(item.ano)}
                            fill={
                              item.ano === selectedYear ? "#f97316" : "#60a5fa"
                            }
                            opacity={item.ano === selectedYear ? 1 : 0.7}
                          />
                        ))}
                        <LabelList
                          dataKey="total"
                          position="top"
                          formatter={(value: number) =>
                            value.toLocaleString("pt-BR")
                          }
                          className="fill-slate-200 text-[10px]"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Texto com total de focos no ano selecionado */}
              {totalAnoSelecionado !== null && selectedYear && (
                <p className="mt-2 text-[11px] text-slate-400">
                  No ano {selectedYear}, foram registrados{" "}
                  {totalAnoSelecionado.toLocaleString("pt-BR")} focos de
                  queimadas{" "}
                  {municipioSelecionado === TODOS_MUNICIPIOS_VALUE
                    ? "em Goiás"
                    : `no município de ${municipioSelecionado}`}
                  .
                </p>
              )}
            </section>

            {/* Gráfico de linhas - comparação mensal */}
            <section>
              <h2 className="mb-2 text-xl font-semibold">
                Comparação mensal: ano selecionado x ano anterior
              </h2>
              <p className="mb-3 max-w-3xl text-xs text-slate-400">
                O gráfico apresenta, para cada mês, o número de focos
                registrados no ano selecionado em comparação ao ano
                imediatamente anterior, filtrado pelo município (ou conjunto de
                municípios) escolhido. Isso ajuda a identificar mudanças na
                sazonalidade das queimadas.
              </p>

              <div className="h-80 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                {errorMensal && (
                  <p className="mb-2 text-xs text-red-400">{errorMensal}</p>
                )}

                {!errorMensal &&
                  !loadingMensal &&
                  dadosMensaisChart.length === 0 && (
                    <p className="text-sm text-slate-400">
                      Nenhum dado mensal encontrado para o ano selecionado.
                    </p>
                  )}

                {dadosMensaisChart.length > 0 && anoMensalSelecionado && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dadosMensaisChart}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      onClick={(chartState: unknown) => {
                        const state = chartState as { activeLabel?: number };
                        if (typeof state.activeLabel === "number") {
                          const mesClicado = state.activeLabel;
                          setMesFiltro(mesClicado);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                        tickFormatter={(value: number) =>
                          mesesLabels.find((m) => m.value === value)?.label ??
                          String(value)
                        }
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        formatter={(value, name) => {
                          const num =
                            typeof value === "number" ? value : Number(value);
                          const rotulo =
                            name === "anoSelecionado"
                              ? `Focos em ${anoMensalSelecionado}`
                              : `Focos em ${anoMensalAnterior ?? ""}`;
                          return [num.toLocaleString("pt-BR"), rotulo];
                        }}
                        labelFormatter={(mes: number) =>
                          mesesLabels.find((m) => m.value === mes)?.label ??
                          `Mês ${mes}`
                        }
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid #1f2937",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          color: "#e5e7eb",
                        }}
                      />
                      <Legend
                        formatter={(value: string) =>
                          value === "anoSelecionado"
                            ? `Ano selecionado ${anoMensalSelecionado ?? ""}`
                            : `Ano anterior ${anoMensalAnterior ?? ""}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="anoSelecionado"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="anoSelecionado"
                      />
                      <Line
                        type="monotone"
                        dataKey="anoAnterior"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="anoAnterior"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

          {/* Coluna direita: mapa + cards */}
          <aside className="h-full rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-2 text-base font-semibold">
              Mapa de focos para o recorte selecionado
            </h2>
            <p className="mb-3 text-xs text-slate-400">
              O mapa mostra os focos de queimadas para o ano, mês e município
              selecionados nos filtros. Ao alterar o município ou o mês, a
              distribuição espacial é atualizada.
            </p>

            {errorMapa && (
              <p className="mb-2 text-xs text-red-400">{errorMapa}</p>
            )}

            <div className="relative h-80 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <MapContainer
                center={mapaCenter}
                zoom={mapaZoom}
                scrollWheelZoom
                className="h-full w-full"
              >
                {/* Atualiza o centro/zoom conforme recorte */}
                <MapUpdater center={mapaCenter} zoom={mapaZoom} />

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {focosMapa.map((f) => {
                  if (!f.lat || !f.lon) return null;

                  const lat = parseFloat(f.lat);
                  const lon = parseFloat(f.lon);
                  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

                  return (
                    <CircleMarker
                      key={f.id}
                      center={[lat, lon]}
                      radius={3}
                      pathOptions={{
                        color: "#f97316",
                        fillColor: "#fb923c",
                        fillOpacity: 0.8,
                      }}
                    >
                      <LeafletTooltip direction="top">
                        <div className="text-xs">
                          <p>
                            <span className="font-semibold">Cidade:</span>{" "}
                            {f.city || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Bioma:</span>{" "}
                            {f.biome || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Data:</span>{" "}
                            {new Date(f.data).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>

              {loadingMapa && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40 text-xs text-slate-200">
                  Carregando focos...
                </div>
              )}

              {!loadingMapa && focosMapa.length === 0 && !errorMapa && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40 text-xs text-slate-400">
                  Nenhum foco encontrado para o recorte selecionado.
                </div>
              )}
            </div>

            {/* Cards abaixo do mapa */}
            {statsMapa && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-400">
                    Total de focos no recorte
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-50">
                    {statsMapa.totalFocos.toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Considerando o ano {selectedYear ?? "—"} e{" "}
                    {labelMesAtual.toLowerCase()}{" "}
                    {municipioSelecionado === TODOS_MUNICIPIOS_VALUE
                      ? "em Goiás."
                      : `no município de ${municipioSelecionado}.`}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-400">
                    Dias sem focos no período
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-50">
                    {statsMapa.diasSemFoco}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {statsMapa.diasPeriodo} dias entre o início e o fim do
                    período selecionado, {statsMapa.diasSemFoco} não registraram
                    focos de queimadas nesse recorte espacial.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </section>
      </section>

      <Footer />
    </main>
  );
};

export default SerieHistoricaPage;
