import Header from "../_components/header";
import Footer from "../_components/footer";

export default function PrevisoesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">
          Previsões de Queimadas em Goiás
        </h1>

        <p className="mb-6 max-w-2xl text-sm text-slate-400">
          Esta página apresentará previsões futuras baseadas em séries temporais
          históricas, combinando métodos estatísticos e modelos de aprendizado
          de máquina. O objetivo é apoiar a tomada de decisão em gestão
          ambiental, prevenção e planejamento estratégico.
        </p>

        {/* CARD PRINCIPAL */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-2 text-xl font-semibold">Modelos Previstos</h2>
          <p className="mb-4 text-sm text-slate-400">
            Os modelos abaixo serão integrados utilizando dados históricos do
            <span className="text-emerald-300"> INPE – BDQueimadas</span>.
          </p>

          <ul className="ml-4 list-disc space-y-3 text-sm text-slate-300">
            <li>
              <strong>ARIMA / SARIMA</strong> – Modelos estatísticos clássicos
              para previsão de séries temporais.
            </li>

            <li>
              <strong>Prophet</strong> – Modelo criado pelo Facebook, excelente
              para decomposição de tendência + sazonalidade.
            </li>

            <li>
              <strong>Redes neurais (LSTM / GRU)</strong> – Modelos profundos
              capazes de capturar padrões complexos de longo prazo.
            </li>

            <li>
              <strong>Modelos híbridos</strong> – Combinação de estatística +
              deep learning para projeções mais robustas.
            </li>
          </ul>
        </div>

        {/* ÁREA PARA GRÁFICOS */}
        <section className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Projeções Futuras</h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-400">
            Em breve, esta seção exibirá gráficos com projeções anuais e
            mensais, destacando cenários de maior risco e períodos críticos
            estimados para os próximos anos.
          </p>

          <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-500">
            Gráfico de previsão entra aqui (ex.: Recharts, Chart.js)
          </div>
        </section>

        {/* MODELOS EM DESENVOLVIMENTO */}
        <section className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Em Desenvolvimento</h2>
          <p className="mb-4 max-w-2xl text-sm text-slate-400">
            A previsão será construída a partir de:
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="mb-2 font-semibold">Preparação dos Dados</p>
              <p className="text-sm text-slate-400">
                Limpeza, agregação e normalização da série histórica
                (2003–2024).
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="mb-2 font-semibold">Treinamento dos Modelos</p>
              <p className="text-sm text-slate-400">
                Testes com ARIMA, Prophet e redes neurais para avaliar o melhor
                desempenho.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="mb-2 font-semibold">Avaliação de Cenários</p>
              <p className="text-sm text-slate-400">
                Construção de cenários pessimista, intermediário e otimista com
                base nas projeções.
              </p>
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
