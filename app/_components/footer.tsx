export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400">
        <p className="font-medium text-slate-300">GeoFire Goiás</p>
        <p className="mt-1 text-xs">
          Dados provenientes do
          <span className="text-emerald-300"> INPE – BDQueimadas</span>.
        </p>

        <p className="mt-3 text-[11px]">
          © 2025 GeoFire Goiás – Plataforma de análise espacial e temporal de
          queimadas.
        </p>
      </div>
    </footer>
  );
}
