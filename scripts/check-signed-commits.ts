import { execFileSync } from "node:child_process";

export interface CommitStatus {
	sha: string;
	signatureStatus: "good" | "unsigned" | "bad" | "unknown";
}

export type CheckResult = { ok: true } | { ok: false; bad: CommitStatus[] };

export function checkSignedCommits(input: {
	commits: CommitStatus[];
}): CheckResult {
	const bad = input.commits.filter((c) => c.signatureStatus !== "good");
	return bad.length === 0 ? { ok: true } : { ok: false, bad };
}

function parseSignatureStatus(raw: string): CommitStatus["signatureStatus"] {
	// git log --pretty='%G?': G=good, U=good/untrusted, N=none, B=bad, E=other
	if (raw === "G" || raw === "U") {
		return "good";
	}
	if (raw === "N") {
		return "unsigned";
	}
	if (raw === "B") {
		return "bad";
	}
	return "unknown";
}

function commitStatus(sha: string): CommitStatus {
	const status = execFileSync("git", ["log", "-1", "--pretty=%G?", sha], {
		encoding: "utf8",
	}).trim();
	return { sha, signatureStatus: parseSignatureStatus(status) };
}

if (import.meta.main) {
	// GITHUB_BASE_REF is the target branch name (e.g. "main"); CI checkout has
	// it only as a remote-tracking ref, so prepend "origin/". Falls back to
	// "origin/main" for local invocations where the env var isn't set.
	const envBase = process.env.GITHUB_BASE_REF;
	const upstream = envBase ? `origin/${envBase}` : "origin/main";
	const range = `${upstream}...HEAD`;
	const shas = execFileSync("git", ["rev-list", range], { encoding: "utf8" })
		.split("\n")
		.filter(Boolean);
	const commits: CommitStatus[] = shas.map(commitStatus);
	const result = checkSignedCommits({ commits });
	if (result.ok) {
		console.log(`✓ all ${commits.length} commit(s) signed`);
		process.exit(0);
	}
	console.error("✗ unsigned or invalid commits:");
	for (const c of result.bad) {
		console.error(`  ${c.sha.slice(0, 7)}  ${c.signatureStatus}`);
	}
	process.exit(1);
}
