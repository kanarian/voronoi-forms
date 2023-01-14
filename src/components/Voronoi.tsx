import React, { useState, useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { GradientOrangeRed, GradientPinkRed } from "@visx/gradient";
import { RectClipPath } from "@visx/clip-path";
import { voronoi, VoronoiPolygon } from "@visx/voronoi";
import { localPoint } from "@visx/event";
import { getSeededRandom } from "@visx/mock-data";
import { IResponse } from "../pages";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import {
  QUESTION_ID_FOR_BILLBOARD,
  QUESTION_ID_FOR_NAME,
} from "../utils/questionIdToTextMapping";
import Modal from "./Modal";

type Datum = {
  x: number;
  y: number;
  id: string;
  response: IResponse;
};

const defaultMargin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 76,
};

export type VoronoiProps = {
  width: number;
  height: number;
  data: Datum[];
  margin?: { top: number; right: number; bottom: number; left: number };
};

export type BillBoardresponseType = {
  name: string;
  billboardresponse: string;
};

function VoronoiDiagram({
  width,
  height,
  data,
  margin = defaultMargin,
}: VoronoiProps) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip, // on hover we will call this function to show tooltip
    hideTooltip, // and this one to hide it
  } = useTooltip();

  const [open, setOpen] = useState(false);

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const voronoiLayout = useMemo(
    () =>
      voronoi<Datum>({
        x: (d) => d.x * innerWidth,
        y: (d) => d.y * innerHeight,
        width: innerWidth,
        height: innerHeight,
      })(data),
    [innerWidth, innerHeight]
  );

  const tooltipDataToShow = tooltipData as IResponse;
  const tooltipNameToShow = tooltipDataToShow?.find(
    (r) => r.questionId === QUESTION_ID_FOR_NAME
  )?.answer;
  const tooltipAnswerToShow = tooltipDataToShow?.find(
    (r) => r.questionId === QUESTION_ID_FOR_BILLBOARD
  )?.answer;

  const currentResponse: BillBoardresponseType = {
    name: tooltipNameToShow || "",
    billboardresponse: tooltipAnswerToShow || "",
  };

  const polygons = voronoiLayout.polygons();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [neighborIds, setNeighborIds] = useState<Set<string>>(new Set());

  let tooltipTimeout: number;
  return width < 10 ? null : (
    <svg width={width} height={height} ref={svgRef}>
      <GradientOrangeRed id="voronoi_orange_red" />
      <GradientPinkRed id="voronoi_pink_red" />
      <RectClipPath
        id="voronoi_clip"
        width={innerWidth}
        height={innerHeight}
        rx={10}
      />
      <Group
        className=" hover:cursor-pointer"
        top={margin.top}
        left={margin.left}
        clipPath="url(#voronoi_clip)"
        onClick={() => setOpen(true)}
        onMouseMove={(event) => {
          if (!svgRef.current) return;
          // find the nearest polygon to the current mouse position
          const point = localPoint(svgRef.current, event);

          if (!point) return;

          const closest = voronoiLayout.find(point.x, point.y);
          console.log(closest);
          if (closest && closest.data) {
            setHoveredId(closest.data.id);
          }

          if (tooltipTimeout) clearTimeout(tooltipTimeout);
          // TooltipInPortal expects coordinates to be relative to containerRef
          // localPoint returns coordinates relative to the nearest SVG, which
          // is what containerRef is set to in this example.
          //   const eventSvgCoords = localPoint(event);
          showTooltip({
            tooltipData: closest?.data?.response,
            tooltipTop: event.clientY,
            tooltipLeft: event.clientX,
          });
        }}
        onMouseLeave={() => {
          if (!open) {
            setHoveredId(null);
            tooltipTimeout = window.setTimeout(() => {
              hideTooltip();
            }, 300);
          }
        }}
      >
        {polygons.map((polygon) => (
          <VoronoiPolygon
            key={`polygon-${polygon.data.id}`}
            polygon={polygon}
            fill={
              hoveredId &&
              (polygon.data.id === hoveredId ||
                neighborIds.has(polygon.data.id))
                ? "url(#voronoi_orange_red)"
                : "url(#voronoi_pink_red)"
            }
            stroke="#fff"
            strokeWidth={1}
            fillOpacity={
              hoveredId && neighborIds.has(polygon.data.id) ? 0.5 : 1
            }
          />
        ))}
        {data.map(({ x, y, id }) => (
          <circle
            key={`circle-${id}`}
            r={2}
            cx={x * innerWidth}
            cy={y * innerHeight}
            fill={id === hoveredId ? "fuchsia" : "#fff"}
            fillOpacity={0.8}
          />
        ))}
      </Group>
      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          {`${tooltipNameToShow ?? ""}`}
        </TooltipInPortal>
      )}
      <Modal open={open} setOpen={setOpen} thisResponse={currentResponse} />
    </svg>
  );
}

export default VoronoiDiagram;
