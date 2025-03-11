import type { InputHTMLAttributes } from "react";

import Label from "~/app/_components/form/Label";

export type Props = InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label: string;
};

export default function Input(props: Props) {
	return (
		<div className="inline-flex flex-col gap-1">
			<InputInner {...props} />
		</div>
	);
}

export function InputInner({ id, label, disabled, ...rest }: Props) {
	return (
		<>
			<Label htmlFor={id} aria-disabled={disabled}>
				{label}
			</Label>
			<input
				{...rest}
				id={id}
				disabled={disabled}
				className="h-9 rounded-md border border-border bg-transparent px-2 text-sm transition-colors_opacity focus-visible:border-input focus-visible:outline-hidden disabled:opacity-50"
			/>
		</>
	);
}
