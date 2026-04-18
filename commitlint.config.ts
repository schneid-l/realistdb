import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"body-max-line-length": [2, "always", 100],
		"footer-max-line-length": [2, "always", 100],
		"subject-case": [2, "always", "sentence-case"],
	},
};

export default config;
