import clsx from "clsx/lite";

type Props = { className?: string };

export default function Search({ className }: Props) {
	return (
		<label
			className={clsx(
				"relative rounded-md bg-muted outline-1 outline-transparent transition-colors focus-within:outline-input",
				className,
			)}
		>
			<div className="iconify absolute left-2 top-1.5 size-5 text-muted-foreground tabler--search" />
			<input
				placeholder="Search"
				className="h-8 min-w-64 bg-transparent pl-10 pr-4 placeholder:text-muted-foreground focus:outline-hidden"
			/>
		</label>
	);
}
