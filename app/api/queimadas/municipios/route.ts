import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.queimadas.findMany({
      where: {
        state: "GOIÁS",
        // como city é String (não-null) no schema, aqui podemos só evitar vazios
        city: {
          not: "",
        },
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    });

    const cities = rows.map((r) => r.city.trim()).filter((c) => c.length > 0);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[API /api/queimadas/municipios] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar municípios." },
      { status: 500 },
    );
  }
}
