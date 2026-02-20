"use client";

type SkeletonProps = {
  variant?: "rect" | "text" | "circular";
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({
  variant = "rect",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
