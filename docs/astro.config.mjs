import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://schneid-l.github.io",
	base: "/realistdb",
	integrations: [
		starlight({
			title: "realistdb",
			description: "A realistic SurrealDB client for TypeScript.",
			social: [],
			sidebar: [
				{
					label: "Getting started",
					autogenerate: { directory: "getting-started" },
				},
				{ label: "Guides", autogenerate: { directory: "guides" } },
				{ label: "Reference", autogenerate: { directory: "reference" } },
				{ label: "Changelog", autogenerate: { directory: "changelog" } },
			],
			customCss: ["./src/styles/custom.css"],
		}),
	],
});
