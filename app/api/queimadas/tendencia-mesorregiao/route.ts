import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // use o MESMO import que você já usa nas outras rotas

type QueimadasPorCidadeRow = {
  ano: number;
  city: string;
  total: bigint | number;
};

type TendenciaMesorregiaoRow = {
  ano: number;
  mesorregiao: string;
  total: number;
};

export async function GET() {
  try {
    // 1) Mapa de município -> mesorregião a partir da tabela Municipios
    const municipios = await prisma.municipios.findMany({
      select: {
        Municipio: true,
        Mesorregiao: true,
      },
    });

    const mapaMesoPorMunicipio = new Map<string, string>();

    for (const m of municipios) {
      if (!m.Municipio || !m.Mesorregiao) continue;
      mapaMesoPorMunicipio.set(m.Municipio.toUpperCase(), m.Mesorregiao);
    }

    // 2) Agrupa queimadas por ANO + CIDADE direto no banco
    const rows = await prisma.$queryRaw<QueimadasPorCidadeRow[]>`
      SELECT
        EXTRACT(YEAR FROM q."data")::int AS ano,
        UPPER(q."city") AS city,
        COUNT(*)::bigint AS total
      FROM "Queimadas" q
      WHERE q."state" = 'GOIÁS'
      GROUP BY ano, city
      ORDER BY ano, city;
    `;

    // 3) Converte cidade -> mesorregiao e agrega de novo: (ano, mesorregiao)
    const agregador = new Map<string, TendenciaMesorregiaoRow>();

    for (const row of rows) {
      const mesorregiao = mapaMesoPorMunicipio.get(row.city);
      if (!mesorregiao) continue; // município não encontrado ou sem mesorregião

      const chave = `${row.ano}|${mesorregiao}`;
      const totalNumber =
        typeof row.total === "bigint" ? Number(row.total) : Number(row.total);

      if (!agregador.has(chave)) {
        agregador.set(chave, {
          ano: row.ano,
          mesorregiao,
          total: totalNumber,
        });
      } else {
        const atual = agregador.get(chave)!;
        atual.total += totalNumber;
      }
    }

    const resultado = Array.from(agregador.values()).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mesorregiao.localeCompare(b.mesorregiao, "pt-BR");
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao calcular tendência por mesorregião:", error);
    return NextResponse.json(
      { error: "Erro ao calcular tendência por mesorregião" },
      { status: 500 },
    );
  }
}
