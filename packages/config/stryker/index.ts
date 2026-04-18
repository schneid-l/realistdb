interface Thresholds {
	break: number;
	high: number;
	low: number;
}

export interface LibraryStrykerConfig {
	coverageAnalysis: "all" | "off" | "perTest";
	mutate: string[];
	reporters: string[];
	tempDirName: string;
	testRunner: "vitest";
	thresholds: Thresholds;
}

export function libraryStrykerConfig(
	overrides: Partial<LibraryStrykerConfig> = {},
): LibraryStrykerConfig {
	return {
		coverageAnalysis: "perTest",
		mutate: ["src/**/*.ts", "!src/**/*.test.ts"],
		reporters: ["html", "json", "clear-text"],
		tempDirName: "reports/mutation/.stryker-tmp",
		testRunner: "vitest",
		thresholds: { break: 50, high: 80, low: 60 },
		...overrides,
	};
}
