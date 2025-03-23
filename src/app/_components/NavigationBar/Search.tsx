"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import clsx from "clsx/lite";
import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

type Props = { className?: string };

export default function Search({ className }: Props) {
	const router = useRouter();
	const [search, setSearch] = useState("");

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (search.trim()) {
			router.push(`/search?query=${encodeURIComponent(search)}`);
		}
	};

	return (
		<form onSubmit={handleSearch} className="relative flex items-center">
			<label className={clsx("relative flex items-center rounded-md bg-muted", className)}>
				<input
					type="text"
					placeholder="Search..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="h-8 min-w-64 bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-none"
				/>
				<button type="submit" className="absolute right-2">
					<SearchRoundedIcon className="size-6 text-muted-foreground" />
				</button>
			</label>
		</form>
	);
}
