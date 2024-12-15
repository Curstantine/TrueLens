import { type ReactNode } from "react";

type Props = { children: ReactNode };

export default function Button({ children }: Props) {
	return (
		<button className="transition-colors_opacity inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground hover:bg-primary/85">
			{children}
		</button>
	);
}
