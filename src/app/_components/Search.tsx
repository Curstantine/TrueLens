import clsx from "clsx/lite";

import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

type Props = { className?: string };

export default function Search({ className }: Props) {
	return (
		<label
			className={clsx(
				"bg-muted focus-within:outline-input relative rounded-md outline-1 outline-transparent transition-colors",
				className,
			)}
		>
			<input
				placeholder="Search"
				className="placeholder:text-muted-foreground h-8 min-w-64 bg-transparent pr-10 pl-4 focus:outline-hidden"
			/>
			<SearchRoundedIcon className="iconify text-muted-foreground tabler--search absolute top-1 right-2 size-6" />
		</label>
	);
}
