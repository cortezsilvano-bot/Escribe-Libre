import type { PageSettings, PageSize } from "@/lib/documents/document-model";
import type { CSSProperties } from "react";

const sizes: Record<PageSize, { width: number; height: number; label: string }> = {
  letter: { width: 816, height: 1056, label: "Letter" },
  a4: { width: 794, height: 1123, label: "A4" },
  legal: { width: 816, height: 1344, label: "Legal" },
};

export function getPageDimensions(settings: PageSettings) {
  const base = sizes[settings.size];
  const width = settings.orientation === "portrait" ? base.width : base.height;
  const height = settings.orientation === "portrait" ? base.height : base.width;

  return {
    width,
    height,
    label: base.label,
  };
}

export function getPageStyle(settings: PageSettings): CSSProperties {
  const dimensions = getPageDimensions(settings);
  const pxPerInch = 96;

  return {
    "--page-width": `${dimensions.width}px`,
    "--page-height": `${dimensions.height}px`,
    "--page-margin-top": `${settings.margins.top * pxPerInch}px`,
    "--page-margin-right": `${settings.margins.right * pxPerInch}px`,
    "--page-margin-bottom": `${settings.margins.bottom * pxPerInch}px`,
    "--page-margin-left": `${settings.margins.left * pxPerInch}px`,
    "--page-zoom": settings.zoom,
  } as CSSProperties;
}
