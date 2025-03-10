import type { InputHTMLAttributes } from "react";

import Label from "~/app/_components/form/Label";

export type Props = InputHTMLAttributes<HTMLTextAreaElement> & {
	id: string;
	label: string;
};

export default function TextArea(props: Props) {
	return (
		<div className="inline-flex flex-col gap-1">
			<TextAreaInner {...props} />
		</div>
	);
}

export function TextAreaInner({ id, label, disabled, ...rest }: Props) {
	return (
		<>
			<Label htmlFor={id} aria-disabled={disabled}>
				{label}
			</Label>
			<textarea
				{...rest}
				id={id}
				disabled={disabled}
				className="h-9 rounded-md border border-border bg-transparent px-2 text-sm transition-colors_opacity focus-visible:border-input focus-visible:outline-hidden disabled:opacity-50"
			/>
		</>
	);
}
