import { dark } from "@/lib/tokens";

type Props = {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
};

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}: Props) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        background: dark.surface2,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
