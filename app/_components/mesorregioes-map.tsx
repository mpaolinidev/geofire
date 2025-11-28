"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { PathOptions, Layer, Path } from "leaflet";
import "leaflet/dist/leaflet.css";

type MesoProperties = {
  [key: string]: unknown;
  Mesorregiao?: string | null;
  NM_MESO?: string | null;
  NOME_MESO?: string | null;
};

type MesoFeature = Feature<Geometry, MesoProperties>;
type MesorregioesFeatureCollection = FeatureCollection<
  Geometry,
  MesoProperties
>;

type MesorregioesMapProps = {
  getColorForMeso: (mesorregiao: string) => string;
  selectedMesos: string[];
  onToggleMeso: (mesorregiao: string) => void;
  onHoverMeso: (mesorregiao: string | null) => void;
  getTooltipForMeso: (mesorregiao: string) => string;
};

export default function MesorregioesMap({
  getColorForMeso,
  selectedMesos,
  onToggleMeso,
  onHoverMeso,
  getTooltipForMeso,
}: MesorregioesMapProps) {
  const [data, setData] = useState<MesorregioesFeatureCollection | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    const loadData = async () => {
      try {
        const res = await fetch("/api/geo/mesorregioes");
        if (!res.ok) {
          throw new Error("Erro ao carregar GeoJSON de mesorregiões.");
        }
        const json = (await res.json()) as MesorregioesFeatureCollection;
        setData(json);
      } catch (error) {
        console.error(error);
      }
    };

    void loadData();
  }, [ready]);

  const getNomeMeso = (props?: MesoProperties): string => {
    if (!props) return "Desconhecida";
    return (
      (props.Mesorregiao as string | null | undefined) ??
      (props.NM_MESO as string | null | undefined) ??
      (props.NOME_MESO as string | null | undefined) ??
      "Desconhecida"
    );
  };

  const styleFeature = (feature: MesoFeature | undefined): PathOptions => {
    const nome = getNomeMeso(feature?.properties);

    const isSelected =
      selectedMesos.length === 0 || selectedMesos.includes(nome);

    const fillColor = isSelected ? getColorForMeso(nome) : "#4b5563";

    return {
      color: "#020617",
      weight: 1.2,
      fillColor,
      fillOpacity: isSelected ? 0.75 : 0.25,
    };
  };

  // sem `any` aqui 🙂
  const handleEachFeature = (
    feature: Feature<Geometry, MesoProperties>,
    layer: Layer,
  ): void => {
    const nome = getNomeMeso(feature.properties);
    const pathLayer = layer as Path;

    const tooltipText = getTooltipForMeso(nome);
    pathLayer.bindTooltip(tooltipText, {
      direction: "center",
      sticky: true,
      opacity: 0.9,
    });

    pathLayer.on("click", () => {
      onToggleMeso(nome);
    });

    pathLayer.on("mouseover", () => {
      onHoverMeso(nome);
      pathLayer.setStyle({ weight: 2 });
    });

    pathLayer.on("mouseout", () => {
      onHoverMeso(null);
      pathLayer.setStyle({ weight: 1.2 });
    });
  };

  if (!ready) {
    return (
      <div className="h-full w-full rounded-xl border border-slate-800 bg-slate-900/60" />
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={[-15.9, -49.2]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data && (
          <GeoJSON
            data={data}
            style={(feature) =>
              styleFeature(feature as MesoFeature | undefined)
            }
            onEachFeature={handleEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
