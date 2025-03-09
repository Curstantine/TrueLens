import clsx from "clsx/lite";

import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

type Props = { className?: string };

export default function Search({ className }: Props) {
	return (
		<label
			className={clsx(
				"relative rounded-md bg-muted outline-1 outline-transparent transition-colors focus-within:outline-input",
				className,
			)}
		>
			<input
				placeholder="Search"
				className="h-8 min-w-64 bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-hidden"
			/>
			<SearchRoundedIcon className="iconify tabler--search absolute top-1 right-2 size-6 text-muted-foreground" />
		</label>
	);
}
