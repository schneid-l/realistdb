import { describe, expect, test } from "bun:test";
import { checkSignedCommits } from "../check-signed-commits.ts";

describe("checkSignedCommits", () => {
	test("passes when every commit reports a good signature", () => {
		const r = checkSignedCommits({
			commits: [
				{ sha: "a1", signatureStatus: "good" },
				{ sha: "b2", signatureStatus: "good" },
			],
		});
		expect(r.ok).toBe(true);
	});

	test("fails with the unsigned commit listed", () => {
		const r = checkSignedCommits({
			commits: [
				{ sha: "a1", signatureStatus: "good" },
				{ sha: "b2", signatureStatus: "unsigned" },
				{ sha: "c3", signatureStatus: "good" },
			],
		});
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.bad).toEqual([{ sha: "b2", signatureStatus: "unsigned" }]);
		}
	});

	test("fails for bad signatures", () => {
		const r = checkSignedCommits({
			commits: [{ sha: "a1", signatureStatus: "bad" }],
		});
		expect(r.ok).toBe(false);
	});
});
