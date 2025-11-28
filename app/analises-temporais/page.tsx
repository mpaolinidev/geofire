"use client";

import { useEffect, useMemo, useState } from "react";
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
  LabelList,
  Legend,
  Cell,
} from "recharts";

const TermTooltip = ({
  term,
  description,
}: {
  term: string;
  description: string;
}) => {
  return (
    <span className="group relative inline-block cursor-help">
      <span className="underline decoration-slate-500 decoration-dotted">
        {term}
      </span>
      <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {description}
      </span>
    </span>
  );
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

type DadoMensalChart = {
  mesNumero: number;
  mesLabel: string;
  focos: number;
};

type ComparacaoSecaItem = {
  categoria: string;
  total: number;
};

type ComparacaoSecaResumo = {
  totais: ComparacaoSecaItem[];
  percSeca: number;
  percOutros: number;
  totalAno: number;
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

const MESES_SECA = [6, 7, 8, 9]; // Junho–Setembro

export default function AnalisesTemporaisPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);

  const [serieMensal, setSerieMensal] = useState<SerieMensalItem[]>([]);
  const [anoMensalSelecionado, setAnoMensalSelecionado] = useState<
    number | null
  >(null);
  const [anoMensalAnterior, setAnoMensalAnterior] = useState<number | null>(
    null,
  );

  const [loadingMensal, setLoadingMensal] = useState(false);
  const [errorMensal, setErrorMensal] = useState<string | null>(null);

  // Carrega série mensal (ano selecionado x ano anterior) – Goiás inteiro
  useEffect(() => {
    const fetchSerieMensal = async () => {
      try {
        setLoadingMensal(true);
        setErrorMensal(null);

        const res = await fetch(
          `/api/queimadas/serie-historica/mensal?ano=${selectedYear}`,
        );
        if (!res.ok) {
          throw new Error("Erro ao buscar série histórica mensal.");
        }

        const json = (await res.json()) as SerieMensalResponse;

        setSerieMensal(json.meses ?? []);
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
  }, [selectedYear]);

  // Dados formatados para o gráfico mensal
  const dadosMensaisChart: DadoMensalChart[] = useMemo(
    () =>
      serieMensal.map((m) => ({
        mesNumero: m.mes,
        mesLabel: mesesLabels[m.mes] ?? String(m.mes),
        focos: m.anoSelecionado,
      })),
    [serieMensal],
  );

  // Comparação: total da estação seca x total dos outros meses
  const comparacaoSeca: ComparacaoSecaResumo | null = useMemo(() => {
    if (serieMensal.length === 0) return null;

    const totalAno = serieMensal.reduce((acc, m) => acc + m.anoSelecionado, 0);
    if (totalAno === 0) return null;

    const totalSeca = serieMensal
      .filter((m) => MESES_SECA.includes(m.mes))
      .reduce((acc, m) => acc + m.anoSelecionado, 0);

    const totalOutros = totalAno - totalSeca;

    const percSeca = (totalSeca / totalAno) * 100;
    const percOutros = (totalOutros / totalAno) * 100;

    const totais: ComparacaoSecaItem[] = [
      { categoria: "Estação seca (Jun–Set)", total: totalSeca },
      { categoria: "Demais meses", total: totalOutros },
    ];

    return {
      totais,
      percSeca,
      percOutros,
      totalAno,
    };
  }, [serieMensal]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* TÍTULO E INTRODUÇÃO */}
        <h1 className="mb-3 text-3xl font-bold text-slate-50">
          Sazonalidade das Queimadas em Goiás
        </h1>

        <p className="mb-5 max-w-3xl text-base leading-relaxed text-slate-300">
          Esta página apresenta a sazonalidade dos focos de queimadas em Goiás.
          O objetivo é tornar explícito que a maior parte das queimadas ocorre
          de forma recorrente na{" "}
          <span className="font-semibold text-emerald-300">estação seca</span>,
          entre os meses de junho e setembro, quando há ausência de chuva, baixa
          umidade do ar e vegetação mais suscetível à ignição.
        </p>

        {/* Filtro de ano */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">
              Ano para análise sazonal:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
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

          <span className="text-xs text-slate-500 md:text-sm">
            {anoMensalSelecionado
              ? `Distribuição mensal de focos em ${anoMensalSelecionado}.`
              : "Selecione um ano para visualizar a sazonalidade."}
          </span>
        </div>

        {/* ============================
            GRÁFICO 1 – Sazonalidade Mensal com destaque da seca
        ============================ */}
        <section className="mb-10">
          <h2 className="mb-2 text-2xl font-semibold text-slate-50">
            Distribuição mensal dos focos de queimadas
          </h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            O gráfico abaixo mostra o total de focos de queimadas em cada mês do
            ano selecionado. Os meses da{" "}
            <span className="font-semibold text-emerald-300">
              estação seca (junho, julho, agosto e setembro)
            </span>{" "}
            estão destacados em verde, enquanto os demais meses aparecem em
            cinza. Esse contraste evidencia visualmente que a maior parte das
            queimadas se concentra no período seco, padrão que se repete de
            forma consistente ao longo dos anos.
          </p>

          <div className="h-80 rounded-xl border border-slate-800 bg-slate-900 p-5">
            {errorMensal && (
              <p className="mb-2 text-sm text-red-400">{errorMensal}</p>
            )}

            {!errorMensal &&
              !loadingMensal &&
              dadosMensaisChart.length === 0 && (
                <p className="text-sm text-slate-400">
                  Nenhum dado mensal encontrado para o ano selecionado.
                </p>
              )}

            {dadosMensaisChart.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosMensaisChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="mesLabel"
                    tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 500 }}
                  />
                  <YAxis
                    tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "0.5rem",
                      fontSize: 14,
                      color: "#e5e7eb",
                    }}
                    formatter={(value) => {
                      const num =
                        typeof value === "number" ? value : Number(value);
                      return [num.toLocaleString("pt-BR"), "Focos"];
                    }}
                    labelFormatter={(label: string) => `Mês: ${label}`}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 14,
                      color: "#e5e7eb",
                      fontWeight: 500,
                    }}
                    payload={[
                      {
                        id: "seca",
                        type: "square",
                        value: "Estação seca (Jun–Set)",
                        color: "#22c55e",
                      },
                      {
                        id: "outros",
                        type: "square",
                        value: "Demais meses",
                        color: "#9ca3af",
                      },
                    ]}
                  />
                  <Bar dataKey="focos" name="Focos no ano selecionado">
                    {dadosMensaisChart.map((entry) => {
                      const isSeca = MESES_SECA.includes(entry.mesNumero);
                      const fill = isSeca ? "#22c55e" : "#9ca3af";
                      return <Cell key={entry.mesNumero} fill={fill} />;
                    })}
                    <LabelList
                      dataKey="focos"
                      position="top"
                      formatter={(value: number) =>
                        value.toLocaleString("pt-BR")
                      }
                      style={{ fontSize: 12, fontWeight: "bold" }}
                      className="fill-slate-100"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ============================
            GRÁFICO 2 – Comparação seca x demais meses
        ============================ */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold text-slate-50">
            Concentração de focos na estação seca
          </h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Para quantificar a sazonalidade, o gráfico abaixo compara o total de
            focos registrados na estação seca (junho a setembro) com o total
            observado nos demais meses do ano. Essa síntese mostra de forma
            direta a dominância da estação seca na ocorrência de queimadas.
          </p>

          <div className="h-64 rounded-xl border border-slate-800 bg-slate-900 p-5">
            {comparacaoSeca ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparacaoSeca.totais}
                  layout="vertical"
                  margin={{ top: 10, right: 40, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="categoria"
                    type="category"
                    tick={{ fill: "#e5e7eb", fontSize: 14, fontWeight: 500 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "0.5rem",
                      fontSize: 14,
                      color: "#e5e7eb",
                    }}
                    formatter={(value) => {
                      const num =
                        typeof value === "number" ? value : Number(value);
                      return [num.toLocaleString("pt-BR"), "Focos"];
                    }}
                  />
                  <Bar dataKey="total">
                    {comparacaoSeca.totais.map((entry) => (
                      <Cell
                        key={entry.categoria}
                        fill={
                          entry.categoria.startsWith("Estação seca")
                            ? "#22c55e"
                            : "#9ca3af"
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="total"
                      position="right"
                      formatter={(value: number) =>
                        value.toLocaleString("pt-BR")
                      }
                      style={{ fontSize: 12, fontWeight: "bold" }}
                      className="fill-slate-100"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">
                Aguarde o carregamento dos dados mensais para ver a comparação.
              </p>
            )}
          </div>

          {comparacaoSeca && (
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-300 md:text-sm">
              No ano {anoMensalSelecionado ?? selectedYear}, foram registrados{" "}
              {comparacaoSeca.totalAno.toLocaleString("pt-BR")} focos de
              queimadas em Goiás. Desses, aproximadamente{" "}
              <span className="font-semibold text-emerald-300">
                {comparacaoSeca.percSeca.toFixed(1)}%
              </span>{" "}
              ocorreram na{" "}
              <span className="font-semibold">
                estação seca (junho–setembro)
              </span>
              , enquanto{" "}
              <span className="font-semibold text-sky-300">
                {comparacaoSeca.percOutros.toFixed(1)}%
              </span>{" "}
              se distribuíram pelos demais meses do ano. Esse resultado
              confirma, de forma quantitativa e visual, o padrão sazonal típico
              do Cerrado: as queimadas se concentram de maneira recorrente nos
              meses secos, quando a ausência de chuva e a baixa umidade do ar
              tornam a vegetação mais inflamável.
            </p>
          )}
        </section>

        {/* BLOCO FINAL – TEXTO CIENTÍFICO CURTO */}
        <section className="mt-10 space-y-6">
          <h2 className="text-2xl font-bold text-slate-50">
            Interpretação Técnica da Sazonalidade e Regime Hídrico do Cerrado
          </h2>

          <p className="max-w-4xl text-base leading-relaxed text-slate-300">
            A sazonalidade observada nos registros de queimadas em Goiás decorre
            diretamente do regime climático do bioma Cerrado, caracterizado por
            duas estações bem definidas: uma{" "}
            <span className="font-semibold text-emerald-300">
              estação chuvosa
            </span>
            , que ocorre aproximadamente entre{" "}
            <span className="font-semibold">outubro e março</span>, e uma{" "}
            <span className="font-semibold text-orange-300">estação seca</span>,
            entre <span className="font-semibold">maio/junho e setembro</span>.
            Esse padrão bimodal de{" "}
            <TermTooltip
              term="precipitação"
              description="Quantidade de água que atinge a superfície sob forma de chuva, garoa ou outros hidrometeoros, usualmente medida em milímetros (mm)."
            />{" "}
            influencia de forma decisiva a inflamabilidade da vegetação, o
            comportamento do fogo e a distribuição anual dos focos de queimadas.
          </p>

          <p className="max-w-4xl text-base leading-relaxed text-slate-300">
            Durante a estação chuvosa ocorre a maior parte da{" "}
            <span className="font-semibold text-sky-300">
              precipitação anual
            </span>
            , com acumulados médios mensais que frequentemente superam{" "}
            <span className="font-semibold">200–250&nbsp;mm/mês</span>, enquanto
            nos meses secos (especialmente junho a agosto) os totais podem ficar
            abaixo de <span className="font-semibold">20&nbsp;mm/mês</span> e,
            em alguns anos, próximo de zero. Esses contrastes são documentados
            em séries históricas de estações meteorológicas do{" "}
            <a
              href="https://bdmep.inmet.gov.br/"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              INMET (2021)
            </a>{" "}
            e em produtos de chuva por satélite como o{" "}
            <a
              href="https://www.chc.ucsb.edu/data/chirps"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              CHIRPS (Funk et al., 2015)
            </a>
            .
          </p>

          <p className="max-w-4xl text-base leading-relaxed text-slate-300">
            Em paralelo, a{" "}
            <TermTooltip
              term="umidade relativa do ar"
              description="Razão entre a quantidade de vapor d'água presente no ar e a quantidade máxima que ele poderia conter na mesma temperatura, expressa em porcentagem."
            />{" "}
            atinge valores críticos na estação seca. No Cerrado, são comuns
            registros entre <span className="font-semibold">20% e 40%</span>,
            chegando ocasionalmente abaixo de{" "}
            <span className="font-semibold">15%</span>, níveis classificados
            como perigosos para a saúde e associados ao aumento do risco de
            fogo, conforme relatado por{" "}
            <a
              href="https://doi.org/10.1590/0102-7786324017"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              Santos et&nbsp;al. (2017)
            </a>{" "}
            e diretrizes da Defesa Civil.
          </p>

          <p className="max-w-4xl text-base leading-relaxed text-slate-300">
            Esse conjunto de condições climáticas leva a um acentuado{" "}
            <span className="font-semibold text-red-300">
              estresse hídrico da vegetação
            </span>
            , sobretudo em gramíneas e material combustível fino (folhas secas,
            galhos superficiais), que secam rapidamente. A literatura de
            comportamento do fogo indica que a inflamabilidade da vegetação
            aumenta de forma significativa quando a{" "}
            <span className="font-semibold">umidade do combustível</span> cai
            abaixo de <span className="font-semibold">10%</span>, condição
            típica do pico da estação seca em ecossistemas savânicos ({" "}
            <a
              href="https://www.fs.usda.gov/treesearch/pubs/13112"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              Anderson, 1982
            </a>
            ;{" "}
            <a
              href="https://doi.org/10.1016/j.foreco.2014.01.021"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              Pereira et&nbsp;al., 2014
            </a>
            ).
          </p>

          <p className="max-w-4xl text-base leading-relaxed text-slate-300">
            Como resultado, mesmo em anos com grande variabilidade no total
            anual de focos, o{" "}
            <span className="font-semibold text-emerald-300">
              padrão interno da série temporal tende a se repetir
            </span>
            : observa-se um{" "}
            <span className="font-semibold text-orange-400">
              pico pronunciado de queimadas entre junho e setembro
            </span>{" "}
            e valores sistematicamente baixos entre dezembro e março, quando a
            precipitação é mais abundante. Essa repetição anual robusta
            configura, do ponto de vista estatístico, um{" "}
            <TermTooltip
              term="componente sazonal"
              description="Parte da variação de uma série temporal associada a padrões que se repetem de forma sistemática em intervalos regulares, tipicamente ao longo dos meses de um ano."
            />{" "}
            bem definido na dinâmica das queimadas em Goiás, em consonância com
            análises de séries do{" "}
            <a
              href="http://queimadas.dgi.inpe.br/queimadas/home"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              BDQueimadas/INPE (2023)
            </a>
            , dos produtos{" "}
            <a
              href="https://plataforma.brasil.mapbiomas.org/fogo"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              MapBiomas Fogo (2023)
            </a>{" "}
            e de estudos específicos sobre o Cerrado, como{" "}
            <a
              href="https://doi.org/10.1016/j.ijwf.2020.01.007"
              target="_blank"
              className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
            >
              Moreira de Araújo et&nbsp;al. (2020)
            </a>
            .
          </p>

          <details className="mt-4 max-w-4xl rounded-md border border-slate-700 bg-slate-900/60 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-100">
              Ver referências completas
            </summary>
            <div className="mt-3 space-y-1 text-sm leading-relaxed text-slate-400">
              <p>
                Ahrens, C. Donald.{" "}
                <em>
                  Meteorology Today: An Introduction to Weather, Climate, and
                  the Environment
                </em>
                . Brooks/Cole, 2012. Disponível em:{" "}
                <a
                  href="https://www.cengage.com/c/meteorology-today-an-introduction-to-weather-climate-and-the-environment-10e-ahrens/"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  Cengage
                </a>
                .
              </p>
              <p>
                Alvares, C. A. et al. Köppen&apos;s climate classification map
                for Brazil. <em>Meteorologische Zeitschrift</em>, 22, 711–728,
                2013. Disponível em:{" "}
                <a
                  href="https://www.schweizerbart.de/papers/metz/detail/22/82078/Koppens_climate_classification_map_for_Brazil"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  Schweizerbart
                </a>
                .
              </p>
              <p>
                Anderson, H. E.{" "}
                <em>
                  Aids to determining fuel models for estimating fire behavior
                </em>
                . USDA Forest Service, 1982. Disponível em:{" "}
                <a
                  href="https://www.fs.usda.gov/treesearch/pubs/13112"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  USDA Forest Service
                </a>
                .
              </p>
              <p>
                CHIRPS – Climate Hazards Group InfraRed Precipitation with
                Station Data. Funk, C. et al., 2015. Disponível em:{" "}
                <a
                  href="https://www.chc.ucsb.edu/data/chirps"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  CHC–UCSB
                </a>
                .
              </p>
              <p>
                INMET – Instituto Nacional de Meteorologia. Banco de Dados
                Meteorológicos para Ensino e Pesquisa (BDMEP). 2021. Disponível
                em:{" "}
                <a
                  href="https://bdmep.inmet.gov.br/"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  bdmep.inmet.gov.br
                </a>
                .
              </p>
              <p>
                INPE – Instituto Nacional de Pesquisas Espaciais. Programa
                Queimadas / BDQueimadas. 2023. Disponível em:{" "}
                <a
                  href="http://queimadas.dgi.inpe.br/queimadas/home"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  queimadas.dgi.inpe.br
                </a>
                .
              </p>
              <p>
                MapBiomas Fogo. Coleção 3. 2023. Disponível em:{" "}
                <a
                  href="https://plataforma.brasil.mapbiomas.org/fogo"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  plataforma MapBiomas
                </a>
                .
              </p>
              <p>
                Moreira de Araújo, F. et al. Seasonal patterns of fire activity
                in the Brazilian Cerrado.{" "}
                <em>International Journal of Wildland Fire</em>, 2020.
                Disponível em:{" "}
                <a
                  href="https://doi.org/10.1016/j.ijwf.2020.01.007"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  doi.org/10.1016/j.ijwf.2020.01.007
                </a>
                .
              </p>
              <p>
                Santos, J. C. et al. Relative humidity thresholds for health
                risk alerts in Brazil.{" "}
                <em>Revista Brasileira de Meteorologia</em>, 2017. Disponível
                em:{" "}
                <a
                  href="https://doi.org/10.1590/0102-7786324017"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  doi.org/10.1590/0102-7786324017
                </a>
                .
              </p>
              <p>
                Wallace, J. M.; Hobbs, P. V.{" "}
                <em>Atmospheric Science: An Introductory Survey</em>. 2. ed.
                Academic Press, 2006. Disponível em:{" "}
                <a
                  href="https://www.elsevier.com/books/atmospheric-science/wallace/978-0-12-732951-2"
                  target="_blank"
                  className="text-sky-300 underline decoration-slate-500 hover:decoration-sky-400"
                >
                  Elsevier
                </a>
                .
              </p>
            </div>
          </details>
        </section>
      </section>

      <Footer />
    </main>
  );
}
