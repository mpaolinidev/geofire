import Image from "next/image";
import Link from "next/link";
import Header from "./_components/header";
import Footer from "./_components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-50 md:text-5xl">
          GeoFire Goiás
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Uma plataforma moderna para visualização, análise temporal e previsão
          de queimadas em Goiás. Dados oficiais diretamente do
          <span className="text-emerald-300"> INPE – BDQueimadas</span>.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/mapa"
            className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
          >
            Ver mapa de queimadas
          </Link>
          <Link
            href="/serie-historica"
            className="rounded-lg border border-slate-700 px-5 py-3 text-slate-200 hover:border-slate-500"
          >
            Explorar série histórica
          </Link>
        </div>
      </section>

      {/* MAPA – CARD DE PREVIEW */}
      <section id="mapa" className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="md:w-1/2">
            <h2 className="mb-4 text-2xl font-semibold">Mapa de Queimadas</h2>
            <p className="mb-4 text-sm text-slate-400">
              Visualização espacial dos focos registrados em Goiás. Na página
              dedicada você poderá interagir com o mapa, aplicar filtros por
              período, município e bioma, e explorar áreas críticas.
            </p>
            <Link
              href="/mapa"
              className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Acessar página do mapa →
            </Link>
          </div>

          <Link
            href="/mapa"
            className="group relative mt-6 block overflow-hidden rounded-xl border border-slate-800 bg-slate-900 md:mt-0 md:w-1/2"
          >
            <div className="relative h-64 w-full">
              <Image
                src="/map-preview.jpg"
                alt="Pré-visualização do mapa de queimadas em Goiás"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">
                Mapa interativo de queimadas
              </span>
              <span className="rounded-full bg-slate-900/70 px-2 py-1 text-[10px] text-emerald-300">
                Ver detalhes
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* SÉRIE HISTÓRICA – CARD DE PREVIEW */}
      <section id="serie" className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center">
          <Link
            href="/serie-historica"
            className="group relative mt-6 block overflow-hidden rounded-xl border border-slate-800 bg-slate-900 md:mt-0 md:w-1/2"
          >
            <div className="relative h-64 w-full">
              <Image
                src="/serie-preview.jpg"
                alt="Pré-visualização da série histórica de queimadas"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">Série histórica 2003+</span>
              <span className="rounded-full bg-slate-900/70 px-2 py-1 text-[10px] text-emerald-300">
                Ver gráficos
              </span>
            </div>
          </Link>

          <div className="md:w-1/2">
            <h2 className="mb-4 text-2xl font-semibold">Série Histórica</h2>
            <p className="mb-4 text-sm text-slate-400">
              Evolução dos focos de queimadas desde 2003. Na página dedicada
              você verá gráficos anuais e mensais, comparações entre períodos e
              destaque para anos com picos fora do padrão.
            </p>
            <Link
              href="/serie-historica"
              className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Acessar página da série histórica →
            </Link>
          </div>
        </div>
      </section>

      {/* ANÁLISES TEMPORAIS – OVERVIEW + CTA */}
      <section id="analises" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-4 text-2xl font-semibold">Análises Temporais</h2>
        <p className="mb-6 max-w-2xl text-sm text-slate-400">
          Tendência, sazonalidade e padrões das queimadas. A página de análises
          temporais reúne métricas e interpretações construídas a partir da
          série histórica, com foco em apoiar decisões e políticas públicas.
        </p>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold">Tendência</p>
            <p className="mt-2 text-sm text-slate-400">
              Análise se a série aponta para aumento, queda ou estabilidade dos
              focos ao longo do tempo.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold">Sazonalidade</p>
            <p className="mt-2 text-sm text-slate-400">
              Identificação dos meses com maior concentração de queimadas e
              padrões de repetição ao longo dos anos.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold">Picos e Anomalias</p>
            <p className="mt-2 text-sm text-slate-400">
              Destaque para períodos extremos, fora do padrão esperado,
              auxiliando investigações detalhadas.
            </p>
          </div>
        </div>

        <Link
          href="/analises-temporais"
          className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Ver página de análises temporais →
        </Link>
      </section>

      {/* PREVISÕES – CONTEXTO FUTURO */}
      <section id="previsoes" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-4 text-2xl font-semibold">Previsões</h2>
        <p className="mb-6 max-w-2xl text-sm text-slate-400">
          Construção futura com modelos de aprendizado de máquina. Esta seção
          será ampliada para incluir cenários projetados a partir do histórico
          de queimadas e variáveis ambientais.
        </p>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          • Baseado em históricos do INPE BDQueimadas
          <br />
          • Modelos ARIMA, Prophet e redes neurais (planejado)
          <br />• Cenários futuros e projeções anual/mensal
        </div>
      </section>

      <Footer />
    </main>
  );
}
