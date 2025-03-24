"use client";

import Link from "next/link";
import { useMediaQuery } from "@jabascript/react/client";
import { usePathname, useSearchParams } from "next/navigation";

import Button from "~/app/_components/form/Button";

import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

export default function Search() {
	const isMobile = useMediaQuery("(max-width: 768px)", false);

	if (isMobile) return <MobileSearch />;
	return <DesktopSearch />;
}

function MobileSearch() {
	return (
		<Link href="/search">
			<Button type="button" intent="icon" shape="circular" className="mr-4">
				<SearchRoundedIcon className="size-6 text-muted-foreground" />
			</Button>
		</Link>
	);
}

function DesktopSearch() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const query = pathname === "/search" ? searchParams.get("q") : undefined;

	return (
		<form action="/search" method="GET">
			<label className="relative hidden rounded-md bg-muted outline-1 outline-transparent transition-colors focus-within:outline-input md:block">
				<input
					name="q"
					type="text"
					placeholder="Search"
					className="h-8 min-w-64 bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-hidden"
					defaultValue={query?.toString()}
				/>
				<SearchRoundedIcon className="absolute top-1 right-2 size-6 text-muted-foreground" />
			</label>
		</form>
	);
}
