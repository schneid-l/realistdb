export interface BudgetInput {
	limit: string;
	name: string;
	path?: string[];
}

export interface BudgetEntry {
	brotli: true;
	limit: string;
	name: string;
	path: string[];
}

export function libraryBudget(input: BudgetInput): BudgetEntry[] {
	return [
		{
			brotli: true,
			limit: input.limit,
			name: input.name,
			path: input.path ?? ["dist/index.js"],
		},
	];
}
