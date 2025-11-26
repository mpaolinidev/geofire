import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    // TIPAGEM CORRETA SEM ANY
    const where: Prisma.QueimadasWhereInput = {
      state: "GOIÁS",
      ...(city ? { city } : {}),
    };

    // Agrupamento por data (puxamos o ano depois)
    const result = await prisma.queimadas.findMany({
      where,
      select: { data: true },
    });

    // Mapeia anos -> totais
    const anoMap: Record<number, number> = {};

    for (const item of result) {
      const ano = new Date(item.data).getFullYear();
      anoMap[ano] = (anoMap[ano] || 0) + 1;
    }

    const serie = Object.entries(anoMap).map(([ano, total]) => ({
      ano: Number(ano),
      total,
    }));

    serie.sort((a, b) => a.ano - b.ano);

    return NextResponse.json({ serie });
  } catch (error) {
    console.error("Erro séria histórica anual:", error);
    return NextResponse.json(
      { error: "Erro ao gerar série anual" },
      { status: 500 },
    );
  }
}
