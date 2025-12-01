import { useMemo, useState } from "react";

import SearchBar from "../component/SearchBar";
import Widget from "../component/widget";
import type { CatalogItem } from "../data/catalogData";

interface CatalogPageProps {
	items: CatalogItem[];
	description?: string;
	onSelect?: (item: CatalogItem) => void;
}

export default function CatalogPage({
	items,
	description,
	onSelect,
}: CatalogPageProps) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter(
			(it) =>
				it.title.toLowerCase().includes(q) ||
				it.platform.toLowerCase().includes(q)
		);
	}, [items, query]);

	return (
		<div className="min-h-screen flex flex-col items-center px-4 sm:px-8">
			{description && (
				<div className="mb-4 text-center text-4xl font-bold">
					{description}
				</div>
			)}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="w-full flex justify-center">
					<div className="w-full sm:w-auto">
						<SearchBar
							value={query}
							onChange={setQuery}
							placeholder="Search by title or platform..."
							className="mx-auto"
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center m-4">
				{filtered.length === 0 ? (
					<div className="col-span-full text-center text-gray-500 py-8 rounded bg-gray-50">
						No results
					</div>
				) : (
					filtered.map((item) => (
						<Widget
							key={item.id}
							title={item.title}
							platform={item.platform}
							color={item.color}
							onClick={() => onSelect?.(item)}
						/>
					))
				)}
			</div>
		</div>
	);
}
