import clsx from "clsx/lite";

type Props = { className?: string };

export default function Search({ className }: Props) {
	return (
		<label
			className={clsx(
				"bg-muted focus-within:outline-input relative rounded-md outline-1 outline-transparent transition-colors",
				className,
			)}
		>
			<div className="iconify text-muted-foreground tabler--search absolute top-1.5 left-2 size-5" />
			<input
				placeholder="Search"
				className="placeholder:text-muted-foreground h-8 min-w-64 bg-transparent pr-4 pl-10 focus:outline-hidden"
			/>
		</label>
	);
}
