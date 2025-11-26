"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type SerieHistoricaItem = {
  ano: number;
  total: number;
};

interface HistoricalSeriesCardProps {
  selectedYear: number;
  onYearChange?: (year: number) => void;
}

export function HistoricalSeriesCard({
  selectedYear,
  onYearChange,
}: HistoricalSeriesCardProps) {
  const [data, setData] = useState<SerieHistoricaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSerie = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/queimadas/serie-historica");
        if (!res.ok) {
          throw new Error("Erro ao buscar série histórica");
        }

        const json = (await res.json()) as { serie: SerieHistoricaItem[] };

        const ordenado = [...json.serie].sort((a, b) => a.ano - b.ano);

        setData(ordenado);
      } catch (error: unknown) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Erro ao carregar série histórica");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchSerie();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Série histórica de focos em Goiás
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Evolução anual dos focos de queimadas no estado de Goiás. Clique em um
          ano para alterar o filtro do mapa.
        </p>
      </CardHeader>
      <CardContent className="h-64">
        {loading && (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Carregando série histórica...
          </div>
        )}

        {error && !loading && (
          <div className="flex h-full items-center justify-center text-xs text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="ano"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => {
                  const num = typeof value === "number" ? value : Number(value);
                  return [num.toLocaleString("pt-BR"), "Total de focos"];
                }}
                labelFormatter={(label: string | number) =>
                  `Ano ${label.toString()}`
                }
              />
              <Bar dataKey="total">
                {data.map((entry: SerieHistoricaItem) => (
                  <Cell
                    key={entry.ano}
                    onClick={() => onYearChange?.(entry.ano)}
                    className="cursor-pointer transition-opacity"
                    fill={entry.ano === selectedYear ? "#f97316" : "#60a5fa"}
                    opacity={entry.ano === selectedYear ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Nenhum dado encontrado para a série histórica.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
