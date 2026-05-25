"use client";

import { useEffect } from "react";
import { useIsDesktop } from "./useMediaQuery";

export function useResponsiveGridZoom(
  setGridZoom: (value: number) => void,
  desktopDefault: number,
  mobileDefault: number,
) {
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setGridZoom(isDesktop ? desktopDefault : mobileDefault);
  }, [isDesktop, desktopDefault, mobileDefault, setGridZoom]);
}
