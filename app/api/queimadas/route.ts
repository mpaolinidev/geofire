import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const ano = Number(searchParams.get("ano"));
    const mes = Number(searchParams.get("mes"));
    const city = searchParams.get("city");

    if (!ano) {
      return NextResponse.json({ error: "Ano obrigatório" }, { status: 400 });
    }

    const inicio = mes === 0 ? new Date(ano, 0, 1) : new Date(ano, mes - 1, 1);
    const fim = mes === 0 ? new Date(ano + 1, 0, 1) : new Date(ano, mes, 1);

    // TIPAGEM CORRETA
    const where: Prisma.QueimadasWhereInput = {
      state: "GOIÁS",
      data: {
        gte: inicio,
        lt: fim,
      },
      ...(city ? { city } : {}),
    };

    const focos = await prisma.queimadas.findMany({
      where,
      orderBy: { data: "asc" },
      select: {
        id: true,
        lat: true,
        lon: true,
        city: true,
        data: true,
        biome: true,
      },
    });

    return NextResponse.json({ ano, mes, focos });
  } catch (error) {
    console.error("Erro API queimadas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
