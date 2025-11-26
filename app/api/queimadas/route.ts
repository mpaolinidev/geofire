import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anoParam = searchParams.get("ano");
    const mesParam = searchParams.get("mes");

    const currentYear = new Date().getFullYear();
    const ano = anoParam ? Number(anoParam) : currentYear - 1;

    if (Number.isNaN(ano)) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' inválido" },
        { status: 400 },
      );
    }

    // mes: 1..12, 0 ou null = ano inteiro
    const mes = mesParam ? Number(mesParam) : 0;
    if (Number.isNaN(mes) || mes < 0 || mes > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mes' inválido" },
        { status: 400 },
      );
    }

    let inicio: Date;
    let fim: Date;

    if (mes === 0) {
      // ano inteiro
      inicio = new Date(ano, 0, 1);
      fim = new Date(ano + 1, 0, 1);
    } else {
      // mês específico
      inicio = new Date(ano, mes - 1, 1);
      if (mes === 12) {
        fim = new Date(ano + 1, 0, 1);
      } else {
        fim = new Date(ano, mes, 1);
      }
    }

    const focos = await prisma.queimadas.findMany({
      where: {
        state: "GOIÁS",
        data: {
          gte: inicio,
          lt: fim,
        },
      },
      select: {
        id: true,
        lat: true,
        lon: true,
        city: true,
        data: true,
        biome: true,
      },
      take: 20000,
    });

    return NextResponse.json({
      ano,
      mes,
      total: focos.length,
      focos,
    });
  } catch (error) {
    console.error("Erro ao carregar dados de queimadas:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
