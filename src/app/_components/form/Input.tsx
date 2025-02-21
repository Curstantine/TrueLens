import type { InputHTMLAttributes } from "react";

import Label from "~/app/_components/form/Label";

type Props = InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label: string;
};

export default function Input({ id, label, disabled, ...rest }: Props) {
	return (
		<div className="inline-flex flex-col gap-1">
			<Label htmlFor={id} aria-disabled={disabled}>
				{label}
			</Label>
			<input
				{...rest}
				id={id}
				disabled={disabled}
				className="border-border transition-colors_opacity focus-visible:border-input h-9 rounded-md border bg-transparent px-2 text-sm focus-visible:outline-hidden disabled:opacity-50"
			/>
		</div>
	);
}
