"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../_components/header";
import Footer from "../_components/footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Carrega componentes do react-leaflet somente no client
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);

const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
);

const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), {
  ssr: false,
});

// Tipo dos focos retornados pela API /api/queimadas
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
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const MapaPage = () => {
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear - 1);
  const [mes, setMes] = useState(0); // 0 = todos os meses
  const [focos, setFocos] = useState<Foco[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const stats = useMemo(() => {
    const totalFocos = focos.length;

    // calcula número de dias no período filtrado
    let diasPeriodo = 0;

    if (mes === 0) {
      // ano inteiro
      const inicio = new Date(ano, 0, 1);
      const fim = new Date(ano + 1, 0, 1);
      const diffMs = fim.getTime() - inicio.getTime();
      diasPeriodo = diffMs / (1000 * 60 * 60 * 24);
    } else {
      // mês específico
      const inicio = new Date(ano, mes - 1, 1);
      const fim = mes === 12 ? new Date(ano + 1, 0, 1) : new Date(ano, mes, 1);
      const diffMs = fim.getTime() - inicio.getTime();
      diasPeriodo = diffMs / (1000 * 60 * 60 * 24);
    }

    const mediaDiaria = diasPeriodo > 0 ? totalFocos / diasPeriodo : 0;

    return {
      totalFocos,
      mediaDiaria,
      diasPeriodo,
    };
  }, [focos, ano, mes]);

  const anosDisponiveis = useMemo(() => {
    const start = 2003;
    const arr: number[] = [];
    for (let y = currentYear; y >= start; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  // Carrega focos da API sempre que ano ou mes mudar
  useEffect(() => {
    const fetchFocos = async () => {
      setLoading(true);
      try {
        const url = `/api/queimadas?ano=${ano}&mes=${mes}`;
        const res = await fetch(url);
        const data = await res.json();
        setFocos(data.focos ?? []);
      } catch (err) {
        console.error("Erro ao carregar focos:", err);
        setFocos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFocos();
  }, [ano, mes]);

  // Top 10 municípios afetados pelo filtro
  const topMunicipios = useMemo(() => {
    const contagem: Record<string, number> = {};

    for (const foco of focos) {
      const key =
        foco.city && foco.city.trim() !== ""
          ? foco.city.trim()
          : "Não informado";
      contagem[key] = (contagem[key] || 0) + 1;
    }

    let lista = Object.entries(contagem).map(([city, total]) => ({
      city,
      total,
    }));

    lista.sort((a, b) =>
      sortDirection === "desc" ? b.total - a.total : a.total - b.total,
    );

    return lista.slice(0, 10);
  }, [focos, sortDirection]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-semibold">
          Mapa de queimadas em Goiás
        </h1>

        <p className="mb-4 max-w-2xl text-sm text-slate-400">
          Visualização dos focos de queimadas registrados em Goiás. Utilize os
          filtros de ano e mês para explorar diferentes períodos e, abaixo do
          mapa, veja os municípios mais afetados.
        </p>

        {/* Filtros */}
        <div className="mb-4 flex flex-col gap-3 text-sm md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="ano" className="text-slate-200">
              Ano:
            </label>
            <select
              id="ano"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
            >
              {anosDisponiveis.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="mes" className="text-slate-200">
              Mês:
            </label>
            <select
              id="mes"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
            >
              {mesesLabels.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <span className="mt-1 text-xs text-slate-500 md:mt-0 md:ml-auto">
            {loading
              ? "Carregando focos..."
              : `Focos carregados: ${focos.length}`}
          </span>
        </div>

        {/* Mapa */}
        <div className="relative z-0 h-[500px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <MapContainer
            center={[-16.6, -49.3]} // centro aproximado de Goiás
            zoom={6}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {focos.map((f) => {
              if (!f.lat || !f.lon) return null;

              const lat = parseFloat(f.lat.trim());
              const lon = parseFloat(f.lon.trim());

              if (isNaN(lat) || isNaN(lon)) return null;

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
                  <Tooltip direction="top">
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
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">
              Total de focos no período
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-50">
              {stats.totalFocos.toLocaleString("pt-BR")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Considerando o ano {ano}
              {mes === 0
                ? " (todos os meses)."
                : ` e o mês de ${
                    mesesLabels.find((m) => m.value === mes)?.label ?? ""
                  }.`}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">
              Média diária de focos
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-50">
              {stats.mediaDiaria.toFixed(1).replace(".", ",")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Média calculada sobre aproximadamente{" "}
              {Math.round(stats.diasPeriodo)} dias no período filtrado.
            </p>
          </div>
        </div>

        {/* Top 10 municípios */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Top 10 municípios com mais focos de queimadas
            </h2>

            {topMunicipios.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="text-slate-400">Ordenar:</span>
                <button
                  type="button"
                  onClick={() => setSortDirection("desc")}
                  className={`rounded-md border px-2 py-1 ${
                    sortDirection === "desc"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  Maior → menor
                </button>
                <button
                  type="button"
                  onClick={() => setSortDirection("asc")}
                  className={`rounded-md border px-2 py-1 ${
                    sortDirection === "asc"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  Menor → maior
                </button>
              </div>
            )}
          </div>

          <p className="mb-3 text-xs text-slate-400">
            Gráfico baseado nos filtros selecionados de ano e mês.
          </p>

          {topMunicipios.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nenhum foco encontrado para o período selecionado.
            </p>
          ) : (
            <div className="h-80 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMunicipios}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  {/* Eixo Y = municípios */}
                  <YAxis
                    type="category"
                    dataKey="city"
                    width={140}
                    tick={{ fontSize: 11, fill: "#e5e7eb" }}
                  />
                  {/* Eixo X = quantidade de focos */}
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#e5e7eb" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#e5e7eb",
                    }}
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  />
                  <Bar
                    dataKey="total"
                    name="Focos"
                    radius={[0, 4, 4, 0]}
                    fill="#4ADE80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </section>

      <Footer />
    </main>
  );
};

export default MapaPage;
