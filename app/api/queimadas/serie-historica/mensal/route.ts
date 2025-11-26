import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const anoSelecionado = Number(searchParams.get("ano"));
    const city = searchParams.get("city");
    const anoAnterior = anoSelecionado - 1;

    if (!anoSelecionado) {
      return NextResponse.json(
        { error: "Ano é obrigatório." },
        { status: 400 },
      );
    }

    // TIPAGEM CORRETA
    const where: Prisma.QueimadasWhereInput = {
      state: "GOIÁS",
      ...(city ? { city } : {}),
    };

    const dados = await prisma.queimadas.findMany({
      where,
      select: { data: true },
    });

    // Inicializa mês -> { sel, ant }
    const mesesMap: Record<number, { sel: number; ant: number }> = {};
    for (let m = 1; m <= 12; m++) {
      mesesMap[m] = { sel: 0, ant: 0 };
    }

    for (const item of dados) {
      const d = new Date(item.data);
      const ano = d.getFullYear();
      const mes = d.getMonth() + 1;

      if (ano === anoSelecionado) mesesMap[mes].sel++;
      if (ano === anoAnterior) mesesMap[mes].ant++;
    }

    const meses = Object.entries(mesesMap).map(([mes, valores]) => ({
      mes: Number(mes),
      anoSelecionado: valores.sel,
      anoAnterior: valores.ant,
    }));

    return NextResponse.json({
      anoSelecionado,
      anoAnterior,
      meses,
    });
  } catch (error) {
    console.error("Erro série mensal:", error);
    return NextResponse.json(
      { error: "Erro ao gerar série mensal" },
      { status: 500 },
    );
  }
}
