import clsx from "clsx/lite";
import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

type Props = { className?: string };

export default function Search({ className }: Props) {
	return (
		<form action="/search" className="relative flex items-center">
			<label className={clsx("relative flex items-center rounded-md bg-muted", className)}>
				<input
					type="text"
					name="q"
					placeholder="Search..."
					className="h-8 min-w-64 appearance-none bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-none"
				/>
				<button type="submit" className="absolute right-2">
					<SearchRoundedIcon className="size-6 text-muted-foreground" />
				</button>
			</label>
		</form>
	);
}
