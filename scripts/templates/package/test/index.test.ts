import { describe, expect, test } from "vitest";
import { placeholder } from "../src/index.js";

describe("placeholder", () => {
	test("exports the package name", () => {
		expect(placeholder).toBe("{{packageName}}");
	});
});
