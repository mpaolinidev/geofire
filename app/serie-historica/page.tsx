import Header from "../_components/header";
import Footer from "../_components/footer";

const SerieHistoricaPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">
          Série histórica de queimadas
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Visualização da evolução dos focos de queimadas desde 2003, com opções
          de agregação anual, mensal e sazonal.
        </p>

        <div className="flex h-[420px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
          Gráficos reais entram aqui (ex.: Chart.js / Recharts).
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default SerieHistoricaPage;
