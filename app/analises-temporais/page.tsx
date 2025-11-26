import Header from "../_components/header";
import Footer from "../_components/footer";

const AnalisesTemporaisPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">Análises temporais</h1>
        <p className="mb-6 text-sm text-slate-400">
          Nesta página serão apresentadas análises de tendência, sazonalidade e
          detecção de picos/anomalias com base na série histórica de queimadas.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="mb-1 font-semibold">Tendência</p>
            <p className="text-sm text-slate-400">
              Espaço reservado para métricas e gráficos de tendência (regressão,
              linha de tendência etc.).
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="mb-1 font-semibold">Sazonalidade</p>
            <p className="text-sm text-slate-400">
              Espaço reservado para decomposição sazonal e análise por mês.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="mb-1 font-semibold">Picos e anomalias</p>
            <p className="text-sm text-slate-400">
              Espaço para indicadores de anos/meses muito acima da média.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AnalisesTemporaisPage;
