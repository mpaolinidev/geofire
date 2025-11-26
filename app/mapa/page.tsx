"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../_components/header";
import Footer from "../_components/footer";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
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
  const [focosAnoInteiro, setFocosAnoInteiro] = useState<Foco[]>([]);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const totalFocos = focos.length;

    let diasPeriodo = 0;

    if (mes === 0) {
      const inicio = new Date(ano, 0, 1);
      const fim = new Date(ano + 1, 0, 1);
      const diffMs = fim.getTime() - inicio.getTime();
      diasPeriodo = diffMs / (1000 * 60 * 60 * 24);
    } else {
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

  // Carrega focos da API sempre que ano ou mes mudar (período filtrado)
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

    void fetchFocos();
  }, [ano, mes]);

  // Carrega focos do ano inteiro (sempre mes=0), usados para o "mês com mais focos" e gráfico de linhas
  useEffect(() => {
    const fetchFocosAnoInteiro = async () => {
      try {
        const url = `/api/queimadas?ano=${ano}&mes=0`;
        const res = await fetch(url);
        const data = await res.json();
        setFocosAnoInteiro(data.focos ?? []);
      } catch (err) {
        console.error("Erro ao carregar focos do ano inteiro:", err);
        setFocosAnoInteiro([]);
      }
    };

    void fetchFocosAnoInteiro();
  }, [ano]);

  // Mês com maior número de focos (considerando o ano inteiro)
  const mesComMaisFocos = useMemo(() => {
    if (focosAnoInteiro.length === 0) return null;

    const contagemPorMes: Record<number, number> = {};

    for (const foco of focosAnoInteiro) {
      const d = new Date(foco.data);
      const mesNumero = d.getMonth() + 1; // 1..12
      contagemPorMes[mesNumero] = (contagemPorMes[mesNumero] || 0) + 1;
    }

    let melhorMes: number | null = null;
    let maxFocos = 0;

    for (const [mesStr, total] of Object.entries(contagemPorMes)) {
      const mesNumero = Number(mesStr);
      if (total > maxFocos) {
        maxFocos = total;
        melhorMes = mesNumero;
      }
    }

    if (melhorMes === null) return null;

    return {
      mes: melhorMes,
      total: maxFocos,
    };
  }, [focosAnoInteiro]);

  // Município com mais focos no período filtrado (ano + mês)
  const municipioComMaisFocos = useMemo(() => {
    if (focos.length === 0) return null;

    const contagem: Record<string, number> = {};

    for (const foco of focos) {
      const key =
        foco.city && foco.city.trim() !== ""
          ? foco.city.trim()
          : "Não informado";
      contagem[key] = (contagem[key] || 0) + 1;
    }

    let melhorMunicipio: string | null = null;
    let maxFocos = 0;

    for (const [city, total] of Object.entries(contagem)) {
      if (total > maxFocos) {
        maxFocos = total;
        melhorMunicipio = city;
      }
    }

    if (!melhorMunicipio) return null;

    return {
      city: melhorMunicipio,
      total: maxFocos,
    };
  }, [focos]);

  // Dados mensais para o gráfico de linhas (ano inteiro)
  const dadosMensais = useMemo(() => {
    const contagemPorMes: Record<number, number> = {};

    for (const foco of focosAnoInteiro) {
      const d = new Date(foco.data);
      const mesNumero = d.getMonth() + 1; // 1..12
      contagemPorMes[mesNumero] = (contagemPorMes[mesNumero] || 0) + 1;
    }

    const dados = [];
    for (let m = 1; m <= 12; m++) {
      dados.push({
        mes: m,
        total: contagemPorMes[m] ?? 0,
      });
    }

    return dados;
  }, [focosAnoInteiro]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-semibold">
          Mapa de queimadas em Goiás
        </h1>

        <p className="mb-4 max-w-2xl text-sm text-slate-400">
          Visualização dos focos de queimadas registrados em Goiás. Utilize os
          filtros de ano e mês para explorar diferentes períodos e interpretar
          os indicadores resumidos abaixo.
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
        <div className="mt-4 mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total de focos no período */}
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

          {/* Média diária */}
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

          {/* Mês com maior número de focos no ano */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">
              Mês com maior número de focos no ano
            </p>
            {mesComMaisFocos ? (
              <>
                <p className="mt-2 text-xl font-bold text-slate-50">
                  {
                    mesesLabels.find((m) => m.value === mesComMaisFocos.mes)
                      ?.label
                  }
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {mesComMaisFocos.total.toLocaleString("pt-BR")} focos em{" "}
                  {
                    mesesLabels.find((m) => m.value === mesComMaisFocos.mes)
                      ?.label
                  }{" "}
                  de {ano}, considerando todo o ano.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Não há dados suficientes para o ano selecionado.
              </p>
            )}
          </div>

          {/* Município com mais focos no período filtrado */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">
              Município com mais focos no período filtrado
            </p>
            {municipioComMaisFocos ? (
              <>
                <p className="mt-2 text-xl font-bold text-slate-50">
                  {municipioComMaisFocos.city}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {municipioComMaisFocos.total.toLocaleString("pt-BR")} focos no
                  período selecionado (ano {ano}
                  {mes === 0
                    ? ", todos os meses."
                    : `, mês ${
                        mesesLabels.find((m) => m.value === mes)?.label ?? ""
                      }.`}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Nenhum foco encontrado para o período selecionado.
              </p>
            )}
          </div>
        </div>

        {/* GRÁFICO DE LINHAS - FOCOS POR MÊS NO ANO SELECIONADO */}
        <section className="mt-6">
          <h2 className="mb-2 text-xl font-semibold">
            Distribuição mensal de focos em {ano}
          </h2>
          <p className="mb-3 max-w-3xl text-xs text-slate-400">
            O gráfico abaixo mostra a quantidade de focos registrados em cada
            mês do ano selecionado, considerando todo o estado de Goiás. Ele
            ajuda a identificar a sazonalidade das queimadas ao longo do ano.
          </p>

          <div className="h-72 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            {dadosMensais.every((d) => d.total === 0) ? (
              <p className="text-sm text-slate-400">
                Nenhum foco registrado ao longo dos meses para o ano
                selecionado.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosMensais}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
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
                    formatter={(value: number) => [
                      value.toLocaleString("pt-BR"),
                      "Total de focos",
                    ]}
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
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Total de focos"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
};

export default MapaPage;
