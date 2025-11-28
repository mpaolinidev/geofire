"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import Header from "../../_components/header";
import Footer from "../../_components/footer";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const MesorregioesMap = dynamic(
  () => import("../../_components/mesorregioes-map"),
  { ssr: false },
);

type TendenciaMesorregiaoItem = {
  ano: number;
  mesorregiao: string;
  total: number;
};

type LinhaTendencia = {
  ano: number;
  [mesorregiao: string]: number;
};

type RadarItem = {
  mesorregiao: string;
  anoAtual: number;
  anoAnterior: number;
};

const BASE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#e11d48",
  "#a855f7",
  "#14b8a6",
  "#facc15",
  "#ec4899",
  "#6366f1",
  "#10b981",
];

function getColorForMesoFactory(mesorregioes: string[]) {
  const map = new Map<string, string>();

  mesorregioes.forEach((meso, idx) => {
    map.set(meso, BASE_COLORS[idx % BASE_COLORS.length]);
  });

  return (mesorregiao: string) => map.get(mesorregiao) ?? "#9ca3af";
}

export default function TendenciaMesorregiaoPage() {
  const [dadosBrutos, setDadosBrutos] = useState<TendenciaMesorregiaoItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMesos, setSelectedMesos] = useState<string[]>([]);
  const [activeMeso, setActiveMeso] = useState<string | null>(null);
  const [hoveredMeso, setHoveredMeso] = useState<string | null>(null);

  // carrega dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/queimadas/tendencia-mesorregiao");
        if (!res.ok) {
          throw new Error("Erro ao buscar tendência por mesorregião.");
        }

        const json = (await res.json()) as TendenciaMesorregiaoItem[];
        setDadosBrutos(json ?? []);

        const anos = Array.from(new Set(json.map((d) => d.ano))).sort(
          (a, b) => a - b,
        );
        const mesos = Array.from(
          new Set(json.map((d) => d.mesorregiao).filter(Boolean)),
        ).sort();

        if (anos.length > 0) {
          setSelectedYear(anos[anos.length - 1]);
        }
        if (mesos.length > 0) {
          setSelectedMesos(mesos);
        }
      } catch (err: unknown) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar tendência por mesorregião.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const anosDisponiveis = useMemo(
    () =>
      Array.from(new Set(dadosBrutos.map((d) => d.ano))).sort((a, b) => a - b),
    [dadosBrutos],
  );

  const mesorregioesUnicas = useMemo(
    () =>
      Array.from(
        new Set(dadosBrutos.map((d) => d.mesorregiao).filter(Boolean)),
      ).sort(),
    [dadosBrutos],
  );

  const getColorForMeso = useMemo(
    () => getColorForMesoFactory(mesorregioesUnicas),
    [mesorregioesUnicas],
  );

  const mesosVisiveis = useMemo(
    () => (selectedMesos.length > 0 ? selectedMesos : mesorregioesUnicas),
    [selectedMesos, mesorregioesUnicas],
  );

  // série histórica para o gráfico de linhas
  const dadosLinha: LinhaTendencia[] = useMemo(() => {
    if (dadosBrutos.length === 0) return [];

    const anos = anosDisponiveis;
    const mesorregioes = mesorregioesUnicas;

    const mapa: Record<number, LinhaTendencia> = {};
    anos.forEach((ano) => {
      mapa[ano] = { ano };
      mesorregioes.forEach((meso) => {
        mapa[ano][meso] = 0;
      });
    });

    dadosBrutos.forEach((item) => {
      if (!mapa[item.ano]) mapa[item.ano] = { ano: item.ano };
      if (!mapa[item.ano][item.mesorregiao])
        mapa[item.ano][item.mesorregiao] = 0;
      mapa[item.ano][item.mesorregiao] += item.total;
    });

    return anos.map((ano) => mapa[ano]);
  }, [dadosBrutos, anosDisponiveis, mesorregioesUnicas]);

  // dados do radar
  const dadosRadar: RadarItem[] = useMemo(() => {
    if (!selectedYear || dadosBrutos.length === 0) return [];

    const anoAtual = selectedYear;
    const anoAnterior = anosDisponiveis
      .filter((a) => a < anoAtual)
      .sort((a, b) => b - a)[0];

    if (!anoAnterior) return [];

    const baseMesos =
      mesosVisiveis.length > 0 ? mesosVisiveis : mesorregioesUnicas;

    const acumulado = (ano: number, meso: string) =>
      dadosBrutos
        .filter((d) => d.ano === ano && d.mesorregiao === meso)
        .reduce((acc, d) => acc + d.total, 0);

    return baseMesos.map((meso) => ({
      mesorregiao: meso,
      anoAtual: acumulado(anoAtual, meso),
      anoAnterior: acumulado(anoAnterior, meso),
    }));
  }, [
    selectedYear,
    dadosBrutos,
    anosDisponiveis,
    mesosVisiveis,
    mesorregioesUnicas,
  ]);

  const anoAnteriorRadar =
    selectedYear &&
    anosDisponiveis.filter((a) => a < selectedYear).sort((a, b) => b - a)[0];

  const handleToggleMeso = (meso: string) => {
    setSelectedMesos((prev) =>
      prev.includes(meso) ? prev.filter((m) => m !== meso) : [...prev, meso],
    );
    setActiveMeso(meso);
  };

  const totalAnoMeso = (ano: number | null, meso: string | null): number => {
    if (!ano || !meso) return 0;
    return dadosBrutos
      .filter((d) => d.ano === ano && d.mesorregiao === meso)
      .reduce((acc, d) => acc + d.total, 0);
  };

  // texto do tooltip no mapa (nome + total de focos no ano selecionado)
  const getTooltipForMeso = (meso: string): string => {
    if (!selectedYear) return meso;
    const total = totalAnoMeso(selectedYear, meso);
    return `${meso}\nFocos em ${selectedYear}: ${total.toLocaleString("pt-BR")}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header>
          <h1 className="mb-2 text-3xl font-bold text-slate-50">
            Tendência de Queimadas por Mesorregião em Goiás
          </h1>
          <p className="max-w-3xl text-sm text-slate-300 md:text-base">
            Série histórica de focos de queimadas agregada por mesorregião, com
            mapa interativo, gráfico de linhas e comparação entre anos em
            gráfico de radar.
          </p>
        </header>

        {/* FILTROS */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">
              Ano de referência:
            </span>
            <select
              value={selectedYear ?? ""}
              onChange={(e) =>
                setSelectedYear(e.target.value ? Number(e.target.value) : null)
              }
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            >
              <option value="">Selecione</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <span className="font-semibold text-slate-200">Mesorregiões:</span>
            <div className="flex flex-wrap gap-2">
              {mesorregioesUnicas.map((meso) => {
                const isActive = mesosVisiveis.includes(meso);
                return (
                  <button
                    key={meso}
                    type="button"
                    onClick={() => handleToggleMeso(meso)}
                    className={`rounded-full border px-2.5 py-1 transition ${
                      isActive
                        ? "border-transparent text-slate-900 shadow"
                        : "border-slate-700 text-slate-300"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? getColorForMeso(meso)
                        : "transparent",
                    }}
                  >
                    {meso}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-400">Carregando dados...</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* MAPA + RADAR */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* MAPA */}
          <div className="h-80 md:h-96">
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Mapa das Mesorregiões
            </h2>
            <p className="mb-3 text-xs text-slate-400 md:text-sm">
              Passe o mouse para ver o total de focos no ano selecionado e
              clique para filtrar a mesorregião nos gráficos.
            </p>
            <MesorregioesMap
              getColorForMeso={getColorForMeso}
              selectedMesos={mesosVisiveis}
              onToggleMeso={handleToggleMeso}
              onHoverMeso={setHoveredMeso}
              getTooltipForMeso={getTooltipForMeso}
            />
            {activeMeso && selectedYear && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-200 md:text-sm">
                <p>
                  <span className="font-semibold">Mesorregião:</span>{" "}
                  {activeMeso}
                </p>
                <p>
                  <span className="font-semibold">
                    Focos em {selectedYear}:
                  </span>{" "}
                  {totalAnoMeso(selectedYear, activeMeso).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              </div>
            )}
          </div>

          {/* RADAR */}
          <div className="h-80 md:h-96">
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              Comparação entre anos (Radar)
            </h2>
            <p className="mb-3 text-xs text-slate-400 md:text-sm">
              Cada eixo representa uma mesorregião. As áreas comparam o ano
              selecionado com o ano anterior mais recente disponível.
            </p>

            <div className="h-full rounded-xl border border-slate-800 bg-slate-900 p-4">
              {(!selectedYear ||
                !anoAnteriorRadar ||
                dadosRadar.length === 0) && (
                <p className="text-sm text-slate-400">
                  Selecione um ano com histórico anterior para visualizar o
                  radar.
                </p>
              )}

              {selectedYear && anoAnteriorRadar && dadosRadar.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={dadosRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="mesorregiao" />
                    <PolarRadiusAxis tick={{ fill: "#e5e7eb", fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #1f2937",
                        borderRadius: "0.5rem",
                        fontSize: 12,
                        color: "#e5e7eb",
                      }}
                      formatter={(value, name) => {
                        const num =
                          typeof value === "number" ? value : Number(value);
                        return [num.toLocaleString("pt-BR"), name as string];
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        color: "#e5e7eb",
                      }}
                    />
                    <Radar
                      name={`Ano ${selectedYear}`}
                      dataKey="anoAtual"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name={`Ano ${anoAnteriorRadar}`}
                      dataKey="anoAnterior"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* GRÁFICO DE LINHAS */}
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-50">
            Série histórica por mesorregião
          </h2>
          <p className="mb-3 text-xs text-slate-400 md:text-sm">
            Evolução anual dos focos de queimadas em cada mesorregião. As
            mesorregiões selecionadas (ou destacadas no mapa) são exibidas
            abaixo.
          </p>

          <div className="h-80 rounded-xl border border-slate-800 bg-slate-900 p-4">
            {dadosLinha.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhum dado disponível para exibir a série histórica.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosLinha}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="ano"
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                      color: "#e5e7eb",
                    }}
                    formatter={(value, name) => {
                      const num =
                        typeof value === "number" ? value : Number(value);
                      return [num.toLocaleString("pt-BR"), name as string];
                    }}
                    labelFormatter={(label: string | number) => `Ano: ${label}`}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                      color: "#e5e7eb",
                    }}
                  />
                  {mesosVisiveis.map((meso) => {
                    const isHovered = hoveredMeso === meso;
                    const isDimmed =
                      hoveredMeso !== null && hoveredMeso !== meso;

                    return (
                      <Line
                        key={meso}
                        type="monotone"
                        dataKey={meso}
                        name={meso}
                        stroke={getColorForMeso(meso)}
                        strokeWidth={isHovered ? 3 : 2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        opacity={isDimmed ? 0.25 : 1}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
