"use client";

import { useMediaQuery } from "@jabascript/react/client";
import clsx from "clsx/lite";
import Button from "~/app/_components/form/Button";

import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

type Props = { className?: string };

export default function Search({ className }: Props) {
	const isMobile = useMediaQuery("(max-width: 768px)", false);

	if (isMobile)
		return (
			<Button type="button" intent="icon" shape="circular" className="mr-4">
				<SearchRoundedIcon className="size-6 text-muted-foreground" />
			</Button>
		);

	return (
		<label
			className={clsx(
				"relative hidden rounded-md bg-muted outline-1 outline-transparent transition-colors focus-within:outline-input md:block",
				className,
			)}
		>
			<input
				placeholder="Search"
				className="h-8 min-w-64 bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-hidden"
			/>
			<SearchRoundedIcon className="absolute top-1 right-2 size-6 text-muted-foreground" />
		</label>
	);
}
