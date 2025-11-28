import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { FeatureCollection, Geometry } from "geojson";

type MesorregioesFeatureCollection = FeatureCollection<
  Geometry,
  { [key: string]: unknown }
>;

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "geo",
      "mesorregioes_goias.geojson",
    );

    const raw = await fs.readFile(filePath, "utf-8");
    const geojson = JSON.parse(raw) as MesorregioesFeatureCollection;

    return NextResponse.json(geojson);
  } catch (error) {
    console.error("Erro ao carregar GeoJSON de mesorregiões:", error);
    return NextResponse.json(
      { error: "Erro ao carregar GeoJSON de mesorregiões" },
      { status: 500 },
    );
  }
}
