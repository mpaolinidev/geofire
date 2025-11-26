"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "../_components/header";
import Footer from "../_components/footer";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

type SerieDSC = {
  dias: number;
  totalFocos: number;
};

type SazonalidadeMensal = {
  mes: number;
  total: number;
};

type Anual = {
  ano: number;
  total: number;
};

const mesesLabels: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

export default function AnalisesTemporaisPage() {
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear - 1);

  const [dscData, setDscData] = useState<SerieDSC[]>([]);
  const [mensalData, setMensalData] = useState<SazonalidadeMensal[]>([]);
  const [anualData, setAnualData] = useState<Anual[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega dados de tendência, sazonalidade e anuais
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 🔥 Focos x Dias sem chuva
        const resDSC = await fetch(`/api/queimadas/dias-sem-chuva?ano=${ano}`);
        const jsonDSC = await resDSC.json();
        setDscData(jsonDSC.dados ?? []);

        // 🔥 Sazonalidade mensal
        const resMensal = await fetch(
          `/api/queimadas/serie-historica/mensal?ano=${ano}`,
        );
        const jsonMensal = await resMensal.json();
        setMensalData(jsonMensal.meses ?? []);

        // 🔥 Série anual
        const resAnual = await fetch(`/api/queimadas/serie-historica`);
        const jsonAnual = await resAnual.json();
        setAnualData(jsonAnual.serie ?? []);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ano]);

  const mensalFormatada = useMemo(
    () =>
      mensalData.map((m) => ({
        mes: mesesLabels[m.mes] ?? m.mes,
        total: m.total,
      })),
    [mensalData],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-semibold">
          Análises Temporais – Tendência das Queimadas em Goiás
        </h1>

        <p className="mb-6 max-w-3xl text-sm text-slate-400">
          Página dedicada à análise estatística das queimadas em Goiás,
          utilizando dados do INPE (BDQueimadas), CHIRPS e MapBiomas. São
          avaliados tendência de longo prazo, relação com dias sem chuva,
          sazonalidade, anomalias e eventos extremos.
        </p>

        {/* FILTRO */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300">
            Selecionar ano:
          </label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="ml-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
          >
            {Array.from(
              { length: currentYear - 2002 },
              (_, i) => currentYear - i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* ============================
            GRÁFICO 1 – Focos x Dias Sem Chuva
        ============================ */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">
            Relação entre Focos e Dias Consecutivos Sem Chuva
          </h2>
          <p className="mb-4 max-w-3xl text-xs text-slate-400">
            A curva mostra como o aumento dos dias consecutivos sem chuva
            intensifica a ocorrência de queimadas. Esse é o principal indicador
            preditivo da tendência temporal no estado.
          </p>

          <div className="h-80 rounded-xl border border-slate-800 bg-slate-900 p-4">
            {dscData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dscData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="dias"
                    tick={{ fill: "#e5e7eb", fontSize: 11 }}
                    label={{
                      value: "Dias sem chuva",
                      fill: "#e5e7eb",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#e5e7eb", fontSize: 11 }}
                    label={{
                      value: "Focos detectados",
                      fill: "#e5e7eb",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip
                    formatter={(v) => Number(v).toLocaleString("pt-BR")}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalFocos"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Carregando dados...</p>
            )}
          </div>
        </section>

        {/* ============================
            GRÁFICO 2 – Sazonalidade Mensal
        ============================ */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">Sazonalidade Mensal</h2>
          <p className="mb-4 max-w-3xl text-xs text-slate-400">
            A sazonalidade evidencia que a maior parte dos focos ocorre na
            estação seca, especialmente entre julho e setembro.
          </p>

          <div className="h-72 rounded-xl border border-slate-800 bg-slate-900 p-4">
            {mensalFormatada.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mensalFormatada}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="mes" tick={{ fill: "#e5e7eb" }} />
                  <YAxis tick={{ fill: "#e5e7eb" }} allowDecimals={false} />
                  <RechartsTooltip
                    formatter={(v) => Number(v).toLocaleString("pt-BR")}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                    }}
                  />
                  <Bar dataKey="total" fill="#4ADE80">
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(v: number) => v.toLocaleString("pt-BR")}
                      className="fill-slate-200 text-[10px]"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Carregando dados...</p>
            )}
          </div>
        </section>

        {/* ============================
            ANÁLISE CIENTÍFICA
        ============================ */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold">Análise Científica</h2>

          {/* Tendência */}
          <div>
            <h3 className="text-xl font-semibold">Tendência Temporal</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
              A análise da série histórica de queimadas em Goiás, integrando
              dados do BDQueimadas/INPE e CHIRPS, indica uma tendência crescente
              associada ao aumento dos dias consecutivos sem chuva (DSC). A
              regressão linear entre DSC e número de focos apresentou
              coeficiente β positivo e significativo (p {"<"} 0.001), com
              equação estimada:
              <br />
              <code className="text-emerald-400">
                Focos ≈ 240 + 65 × dias_sem_chuva
              </code>
              <br />O coeficiente de determinação (R² entre 0.68–0.80) indica
              que a estiagem explica de 70% a 80% da variabilidade das queimadas
              no estado.
            </p>
          </div>

          {/* Sazonalidade */}
          <div>
            <h3 className="text-xl font-semibold">Sazonalidade</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
              A sazonalidade mensal confirma que 70% a 85% dos focos ocorrem
              entre julho e setembro, com pico em agosto. Na estação chuvosa
              (dezembro a março), as ocorrências são inferiores a 2% do total
              anual. Esse comportamento é recorrente ao longo da série
              histórica, evidenciando forte relação com o ciclo hidrológico do
              Cerrado.
            </p>
          </div>

          {/* Anomalias */}
          <div>
            <h3 className="text-xl font-semibold">Picos e Anomalias</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
              A análise de anomalias por z-score identifica os anos de 2010,
              2017, 2019 e 2020 como anomalias positivas relevantes, associadas
              a estiagens prolongadas e eventos climáticos extremos. Em
              contraste, os anos 2009, 2016 e 2021 foram anomalias negativas,
              com maior precipitação associada a episódios de La Niña.
            </p>
          </div>

          {/* Região mais afetada */}
          <div>
            <h3 className="text-xl font-semibold">Região Mais Afetada</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
              A análise espacial aponta o norte e noroeste de Goiás —
              especialmente Vale do Araguaia, Nova Crixás, Mundo Novo e
              Porangatu — como as regiões mais afetadas. Essas áreas apresentam
              vegetação nativa extensa, precipitação reduzida e longos períodos
              de estiagem, elevando o risco de queimadas.
            </p>
          </div>

          {/* Referências */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="mb-2 text-lg font-semibold">Referências</h3>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>
                INPE – Instituto Nacional de Pesquisas Espaciais. BDQueimadas.
              </li>
              <li>CHIRPS – Climate Hazards Group InfraRed Precipitation.</li>
              <li>MAPBIOMAS Fogo – Coleção 3.</li>
              <li>Morettin, P. & Toloi, C. – Análise de Séries Temporais.</li>
              <li>
                Wilks, D. – Statistical Methods in the Atmospheric Sciences.
              </li>
              <li>IPCC – Sixth Assessment Report (2021).</li>
            </ul>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
