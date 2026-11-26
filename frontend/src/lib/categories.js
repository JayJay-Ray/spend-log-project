import { CATEGORY_PALETTE_SIZE } from "./constants.js";

export const MONOCHROMATIC_PALETTE = [
  "#124E66",
  "#2B677F",
  "#458CA6",
  "#74A9BD",
  "#A3C6D4",
];

export function getCategoryColor(category) {
  let hash = 0;

  for (let index = 0; index < category.length; index += 1) {
    hash = (hash * 31 + category.charCodeAt(index)) >>> 0;
  }

  return MONOCHROMATIC_PALETTE[hash % CATEGORY_PALETTE_SIZE];
}

export function getChartColor(index) {
  return MONOCHROMATIC_PALETTE[index % MONOCHROMATIC_PALETTE.length];
}
