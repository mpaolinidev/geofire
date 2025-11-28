import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import type { FeatureCollection, Feature, Geometry } from "geojson";

type MunicipioDbRow = {
  Municipio: string | null;
  Mesorregiao: string | null;
};

type MunicipioProperties = {
  [key: string]: unknown;
  Municipio?: string;
  NM_MUN?: string;
  NOME_MUN?: string;
  NM_MUNICIP?: string;
  Mesorregiao?: string | null;
  MESORREGIAO?: string | null;
};

type MunicipioFeature = Feature<Geometry, MunicipioProperties>;
type MunicipiosFeatureCollection = FeatureCollection<
  Geometry,
  MunicipioProperties
>;

export async function GET() {
  try {
    // 1) Ler GeoJSON de municípios (caminho: public/geo/municipios_goias.geojson)
    const filePath = path.join(
      process.cwd(),
      "public",
      "geo",
      "municipios_goias.geojson",
    );

    const raw = await fs.readFile(filePath, "utf-8");
    const geojson = JSON.parse(raw) as MunicipiosFeatureCollection;

    // 2) Buscar município + Mesorregiao no banco
    const municipios: MunicipioDbRow[] = await prisma.municipios.findMany({
      select: {
        Municipio: true,
        Mesorregiao: true,
      },
    });

    const mapaMesoPorNome = new Map<string, string>();

    for (const m of municipios) {
      if (m.Municipio && m.Mesorregiao) {
        mapaMesoPorNome.set(m.Municipio.toUpperCase(), m.Mesorregiao);
      }
    }

    // 3) Injetar Mesorregiao nas features usando NOME do município
    const features: MunicipioFeature[] = geojson.features.map((feat) => {
      const props: MunicipioProperties = (feat.properties ??
        {}) as MunicipioProperties;

      const nomePossivel =
        props.Municipio ??
        props.NM_MUN ??
        props.NOME_MUN ??
        props.NM_MUNICIP ??
        "";

      const chaveNome = String(nomePossivel).toUpperCase();
      const mesorregiao = chaveNome
        ? (mapaMesoPorNome.get(chaveNome) ?? null)
        : null;

      const novasProps: MunicipioProperties = {
        ...props,
        Mesorregiao:
          mesorregiao ?? props.Mesorregiao ?? props.MESORREGIAO ?? null,
      };

      const novaFeature: MunicipioFeature = {
        ...feat,
        properties: novasProps,
      };

      return novaFeature;
    });

    const out: MunicipiosFeatureCollection = {
      ...geojson,
      features,
    };

    return NextResponse.json(out);
  } catch (error) {
    console.error(
      "Erro ao montar GeoJSON de mesorregiões por município:",
      error,
    );
    return NextResponse.json(
      { error: "Erro ao montar GeoJSON de mesorregiões por município" },
      { status: 500 },
    );
  }
}
