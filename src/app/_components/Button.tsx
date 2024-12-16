import clsx from "clsx/lite";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export default function Button({ children, className, ...rest }: Props) {
	return (
		<button
			className={clsx(
				"inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground transition-colors_opacity hover:bg-primary/85",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...rest}
		>
			{children}
		</button>
	);
}
