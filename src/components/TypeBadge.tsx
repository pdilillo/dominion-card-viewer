import type { CSSProperties } from "react";
import { getTypeColorVar } from "@/lib/cardTypeColors";

type Props = {
  type: string;
  active?: boolean;
  size?: "xs" | "sm";
  onClick?: () => void;
};

const SIZE_CLASSES = {
  xs: "px-1 py-0.5 text-[9px]",
  sm: "px-2 py-0.5 text-xs",
};

export function TypeBadge({ type, active = false, size = "sm", onClick }: Props) {
  const colorVar = getTypeColorVar(type);
  const sizeClass = SIZE_CLASSES[size];
  const className = [
    "type-badge rounded-full border transition",
    sizeClass,
    colorVar ? "type-badge--colored" : active ? "type-badge--active-fallback" : "",
    active && colorVar ? "type-badge--active" : "",
    onClick ? "cursor-pointer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = colorVar
    ? ({ "--badge-color": `var(${colorVar})` } as CSSProperties)
    : undefined;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {type}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {type}
    </span>
  );
}
