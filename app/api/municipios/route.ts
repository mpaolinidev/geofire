// app/api/queimadas/seriehistorica/municipios/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const ano = Number(searchParams.get("ano"));
    const anoComparacao = Number(searchParams.get("anoComparacao"));
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "Parâmetro 'city' é obrigatório." },
        { status: 400 },
      );
    }

    const rows = await prisma.$queryRaw<
      { ano: number; mes: number; total: number }[]
    >`
      SELECT
        EXTRACT(YEAR FROM data)::int AS ano,
        EXTRACT(MONTH FROM data)::int AS mes,
        COUNT(*)::int AS total
      FROM "Queimadas"
      WHERE "state" = 'GOIÁS'
        AND "city" = ${city}
        AND EXTRACT(YEAR FROM data)::int IN (${ano}, ${anoComparacao})
      GROUP BY 1,2
      ORDER BY 2,1
    `;

    const meses = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      return {
        mes,
        anoBase: rows.find((r) => r.ano === ano && r.mes === mes)?.total ?? 0,
        anoComparacao:
          rows.find((r) => r.ano === anoComparacao && r.mes === mes)?.total ??
          0,
      };
    });

    return NextResponse.json({
      city,
      anoBase: ano,
      anoComparacao,
      meses,
    });
  } catch (error) {
    console.error("[API municipios/serie] erro:", error);
    return NextResponse.json(
      { error: "Erro ao gerar série histórica por município." },
      { status: 500 },
    );
  }
}
