import type { UserConfig } from "tsdown";

export interface LibraryConfigInput {
  dts?: boolean;
  entry: string | readonly string[];
  platform?: "neutral" | "node" | "browser";
  sourcemap?: boolean;
  treeshake?: boolean;
}

export function libraryConfig(input: LibraryConfigInput): UserConfig {
  const entry = Array.isArray(input.entry)
    ? [...input.entry]
    : [input.entry as string];
  return {
    entry,
    format: ["esm"],
    platform: input.platform ?? "neutral",
    dts: input.dts ?? true,
    sourcemap: input.sourcemap ?? true,
    clean: true,
    treeshake: input.treeshake ?? true,
    outDir: "dist",
    unbundle: false,
  };
}
