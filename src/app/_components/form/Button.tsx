import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const btn = cva(
	"inline-flex h-9 items-center justify-center rounded-md text-sm transition-colors_opacity disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			intent: {
				primary: "bg-primary text-primary-foreground hover:bg-primary/85",
				border: "bg-transparent border border-input text-input hover:bg-input hover:text-background",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/85",
				destructiveBorder:
					"bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-background",
			},
		},
		defaultVariants: {
			intent: "primary",
		},
	},
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn>;

export default function Button({ children, className, intent, ...rest }: Props) {
	return (
		<button className={btn({ intent, className })} {...rest}>
			{children}
		</button>
	);
}
