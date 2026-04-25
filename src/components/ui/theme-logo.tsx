"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

type Props = {
  width?: number;
  height?: number;
};

export function ThemeLogo({ width = 32, height = 32 }: Props) {
  const { theme } = useTheme();
  const src = theme === "light" ? "/logo-dark.svg" : "/logo-white.svg";

  return (
    <Image
      src={src}
      alt="The Source"
      width={width}
      height={height}
      style={{ flexShrink: 0 }}
    />
  );
}
