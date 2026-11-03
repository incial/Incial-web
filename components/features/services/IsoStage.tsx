"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { getServiceIcon } from "./serviceIcons";
import type { ServiceCategory } from "@/lib/serviceCatalog";
import {
  BASE_LID_GAP,
  LOGO_PATHS,
  LOGO_SCALE,
  PLATE_RADIUS,
  PLATE_SIDE,
  PLATE_SPACING,
  PLATE_THICKNESS,
  SLAB_RADIUS,
  SLAB_SIDE,
  SLAB_THICKNESS,
  STACK_CY,
  type StageSpec,
  clamp01,
  smoothstep,
} from "./isoGeometry";

interface IsoStageProps {
  spec: StageSpec;
  categories: ReadonlyArray<ServiceCategory>;
  /** Continuous sub-service position (0 .. total - 1). */
  active: MotionValue<number>;
  /** 0 = flat dust logo, 1 = isometric logo (also drives the dust morph). */
  morph: MotionValue<number>;
  /** Number of plates currently open in the stack (continuous, 0 .. total). */
  revealed: MotionValue<number>;
}

const ISO = "scale(1,0.5) rotate(45)";
/** Edge length (in plate-plane units) of the icon lying flat at the centre of each plate. */
const PLATE_ICON = 46;
const ICON_STROKE = {
  fill: "none",
  stroke: "#ffffff",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const steps = (count: number) => Array.from({ length: count }, (_, k) => k + 1);
const SLAB_STEPS = steps(SLAB_THICKNESS);
const PLATE_STEPS = steps(PLATE_THICKNESS);

function Extrusion({
  side,
  radius,
  stepList,
  fill,
}: {
  side: number;
  radius: number;
  stepList: number[];
  fill: string;
}) {
  return (
    <>
      {stepList.map((k) => (
        <rect
          key={k}
          x={-side / 2}
          y={-side / 2}
          width={side}
          height={side}
          rx={radius}
          transform={`translate(0,${k}) ${ISO}`}
          fill={fill}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}

function Base({ y, stackX }: { y: MotionValue<number>; stackX: number }) {
  return (
    <motion.g style={{ y }}>
      <g transform={`translate(${stackX} 0)`} opacity="0.5">
        <Extrusion side={SLAB_SIDE} radius={SLAB_RADIUS} stepList={SLAB_STEPS} fill="#0b0b0d" />
        <rect
          x={-SLAB_SIDE / 2}
          y={-SLAB_SIDE / 2}
          width={SLAB_SIDE}
          height={SLAB_SIDE}
          rx={SLAB_RADIUS}
          transform={ISO}
          fill="#070708"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.3"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={-SLAB_SIDE * 0.34}
          y={-SLAB_SIDE * 0.34}
          width={SLAB_SIDE * 0.68}
          height={SLAB_SIDE * 0.68}
          rx={SLAB_RADIUS * 0.6}
          transform={ISO}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </motion.g>
  );
}

function Lid({ y, stackX }: { y: MotionValue<number>; stackX: number }) {
  return (
    <motion.g style={{ y }}>
      <g transform={`translate(${stackX} 0)`} opacity="0.5">
        <Extrusion side={SLAB_SIDE} radius={SLAB_RADIUS} stepList={SLAB_STEPS} fill="#0d0d0f" />
        <rect
          x={-SLAB_SIDE / 2}
          y={-SLAB_SIDE / 2}
          width={SLAB_SIDE}
          height={SLAB_SIDE}
          rx={SLAB_RADIUS}
          transform={ISO}
          fill="#050506"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <g transform={`${ISO} scale(${LOGO_SCALE})`} fill="#ffffff">
          <circle cx={LOGO_PATHS.dot.cx} cy={LOGO_PATHS.dot.cy} r={LOGO_PATHS.dot.r} />
          <path d={LOGO_PATHS.lower} />
          <path d={LOGO_PATHS.tall} />
        </g>
      </g>
    </motion.g>
  );
}

function Plate({
  index,
  stackX,
  active,
  revealed,
  baseY,
}: {
  index: number;
  stackX: number;
  active: MotionValue<number>;
  revealed: MotionValue<number>;
  baseY: MotionValue<number>;
}) {
  const open = useTransform(revealed, (r) => smoothstep(r - index));
  const y = useTransform(baseY, (b) => b - (index + 1) * PLATE_SPACING);
  const x = useTransform(open, (o) => (1 - o) * 80);
  const act = useTransform([active, open], ([a, o]: number[]) =>
    clamp01(1 - Math.abs(a - index)) * o,
  );
  const topFill = useTransform(act, [0, 1], ["rgba(16,16,20,0.4)", "rgba(59,130,246,0.85)"]);
  const edgeFill = useTransform(act, [0, 1], ["rgba(10,10,12,0.55)", "rgba(29,75,168,0.9)"]);
  const strokeOpacity = useTransform(act, [0, 1], [0.38, 0.95]);

  return (
    <motion.g style={{ y, x, opacity: open }}>
      <g transform={`translate(${stackX} 0)`}>
        <g opacity="0.5">
        {PLATE_STEPS.map((k) => (
          <motion.rect
            key={k}
            x={-PLATE_SIDE / 2}
            y={-PLATE_SIDE / 2}
            width={PLATE_SIDE}
            height={PLATE_SIDE}
            rx={PLATE_RADIUS}
            transform={`translate(0,${k}) ${ISO}`}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ fill: edgeFill }}
          />
        ))}
        <motion.rect
          x={-PLATE_SIDE / 2}
          y={-PLATE_SIDE / 2}
          width={PLATE_SIDE}
          height={PLATE_SIDE}
          rx={PLATE_RADIUS}
          transform={ISO}
          stroke="#ffffff"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ fill: topFill, strokeOpacity }}
        />
        </g>
      </g>
    </motion.g>
  );
}

function PlateIcon({
  index,
  label,
  stackX,
  active,
  revealed,
  baseY,
}: {
  index: number;
  label: string;
  stackX: number;
  active: MotionValue<number>;
  revealed: MotionValue<number>;
  baseY: MotionValue<number>;
}) {
  const open = useTransform(revealed, (r) => smoothstep(r - index));
  const y = useTransform(baseY, (b) => b - (index + 1) * PLATE_SPACING);
  const x = useTransform(open, (o) => (1 - o) * 80);
  const act = useTransform([active, open], ([a, o]: number[]) =>
    clamp01(1 - Math.abs(a - index)) * o,
  );
  const opacity = useTransform([open, act], ([o, a]: number[]) => o * (0.55 + 0.45 * a));
  const stroke = useTransform(act, [0, 1], ["#e6e8ee", "#a9cbff"]);

  return (
    <motion.g style={{ y, x, opacity }}>
      <g transform={`translate(${stackX} 0)`}>
        <motion.g
          transform={`${ISO} scale(${PLATE_ICON / 24}) translate(-12 -12)`}
          {...ICON_STROKE}
          style={{ stroke }}
        >
          {getServiceIcon(label)}
        </motion.g>
      </g>
    </motion.g>
  );
}

export default function IsoStage({ spec, categories, active, morph, revealed }: IsoStageProps) {
  const labels = categories.flatMap((c) => c.services);

  const baseY = useTransform(revealed, (r) => STACK_CY + (r * PLATE_SPACING) / 2 + 13);
  const lidY = useTransform(
    [baseY, revealed],
    ([b, r]: number[]) => b - BASE_LID_GAP - r * PLATE_SPACING,
  );
  const crispOpacity = useTransform(morph, (m) => smoothstep((m - 0.6) / 0.4));

  return (
    <div className="relative h-full w-full">
      <motion.svg
        viewBox={`0 0 ${spec.viewW} ${spec.viewH}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        style={{ opacity: crispOpacity }}
        aria-hidden
      >
        <Base y={baseY} stackX={spec.stackX} />
        {labels.map((label, i) => (
          <Plate
            key={`${label}-${i}`}
            index={i}
            stackX={spec.stackX}
            active={active}
            revealed={revealed}
            baseY={baseY}
          />
        ))}
        <Lid y={lidY} stackX={spec.stackX} />
        {labels.map((label, i) => (
          <PlateIcon
            key={`icon-${label}-${i}`}
            index={i}
            label={label}
            stackX={spec.stackX}
            active={active}
            revealed={revealed}
            baseY={baseY}
          />
        ))}
      </motion.svg>
    </div>
  );
}
