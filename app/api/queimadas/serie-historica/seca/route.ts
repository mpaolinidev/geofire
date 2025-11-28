// /app/api/queimadas/serie-historica/seca/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dados = await prisma.queimadas.groupBy({
      by: ["data"],
      _count: { id: true },
    });

    // Considera meses de Junho–Setembro
    const SECA = [6, 7, 8, 9];

    // Agrupa por ano, somando apenas meses da seca
    const porAno: Record<number, number> = {};

    for (const d of dados) {
      const dt = new Date(d.data);
      const ano = dt.getFullYear();
      const mes = dt.getMonth() + 1;

      if (!SECA.includes(mes)) continue;

      if (!porAno[ano]) porAno[ano] = 0;
      porAno[ano] += d._count.id;
    }

    const serie = Object.entries(porAno)
      .map(([ano, total]) => ({
        ano: Number(ano),
        total,
      }))
      .sort((a, b) => a.ano - b.ano);

    return NextResponse.json({ serie });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao gerar série histórica da seca" },
      { status: 500 },
    );
  }
}
