import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "src", "data");

export function readJSON<T>(file: string): T[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
  } catch {
    return [];
  }
}

export function writeJSON<T>(file: string, data: T[]): void {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

export function readSingleJSON<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
  } catch {
    return null;
  }
}

export function writeSingleJSON<T>(file: string, data: T): void {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}
