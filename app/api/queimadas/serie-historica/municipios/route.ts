// app/api/serie-historica/municipios/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MensalRow = {
  ano: number;
  mes: number;
  total: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const anoParam = searchParams.get("ano");
    const anoCompParam = searchParams.get("anoComparacao");
    const city = searchParams.get("city");

    if (!anoParam) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' é obrigatório." },
        { status: 400 },
      );
    }

    if (!city || city.trim() === "") {
      return NextResponse.json(
        { error: "Parâmetro 'city' (município) é obrigatório." },
        { status: 400 },
      );
    }

    const anoBase = Number(anoParam);
    if (Number.isNaN(anoBase) || anoBase < 1900) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido." },
        { status: 400 },
      );
    }

    const anoComparacao = anoCompParam ? Number(anoCompParam) : anoBase - 1;
    if (Number.isNaN(anoComparacao) || anoComparacao < 1900) {
      return NextResponse.json(
        { error: "Parâmetro 'anoComparacao' inválido." },
        { status: 400 },
      );
    }

    const rows = await prisma.$queryRaw<MensalRow[]>`
      SELECT
        EXTRACT(YEAR FROM "data")::int AS "ano",
        EXTRACT(MONTH FROM "data")::int AS "mes",
        COUNT(*)::int AS "total"
      FROM "Queimadas"
      WHERE "state" = 'GOIÁS'
        AND "city" = ${city}
        AND EXTRACT(YEAR FROM "data")::int IN (${anoBase}, ${anoComparacao})
      GROUP BY EXTRACT(YEAR FROM "data"), EXTRACT(MONTH FROM "data")
      ORDER BY "mes", "ano"
    `;

    const meses: {
      mes: number;
      anoBase: number;
      anoComparacao: number;
    }[] = [];

    for (let mes = 1; mes <= 12; mes++) {
      const base = rows.find((r) => r.ano === anoBase && r.mes === mes);
      const comp = rows.find((r) => r.ano === anoComparacao && r.mes === mes);

      meses.push({
        mes,
        anoBase: base?.total ?? 0,
        anoComparacao: comp?.total ?? 0,
      });
    }

    return NextResponse.json({
      city,
      anoBase,
      anoComparacao,
      meses,
    });
  } catch (error) {
    console.error("[API /serie-historica/municipios] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao montar série histórica por município." },
      { status: 500 },
    );
  }
}
