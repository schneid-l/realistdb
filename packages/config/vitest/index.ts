import type { UserConfig } from "vitest/config";

export function libraryTestConfig(overrides: UserConfig = {}): UserConfig {
	return {
		...overrides,
		test: {
			coverage: {
				exclude: ["**/*.test.ts", "**/*.test-d.ts"],
				include: ["src/**/*.ts"],
				provider: "v8",
				reporter: ["text", "html", "lcov"],
				thresholds: {
					branches: 95,
					functions: 100,
					lines: 100,
					statements: 100,
				},
			},
			environment: "node",
			globals: false,
			include: ["test/**/*.test.ts", "src/**/*.test.ts"],
			typecheck: {
				enabled: true,
				include: ["test/**/*.test-d.ts", "src/**/*.test-d.ts"],
			},
			...overrides.test,
		},
	};
}
