import type { DetailedHTMLProps, LabelHTMLAttributes } from "react";

type Props = Pick<
	DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>,
	"htmlFor" | "aria-disabled" | "children"
>;

export default function Label({ htmlFor, "aria-disabled": disabled, children }: Props) {
	return (
		<label
			htmlFor={htmlFor}
			aria-disabled={disabled}
			className="text-sm aria-disabled:opacity-75"
		>
			{children}
		</label>
	);
}
