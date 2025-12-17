import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind/clsx 样式 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}