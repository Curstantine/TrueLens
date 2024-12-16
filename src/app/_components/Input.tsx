import { type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label: string;
};

export default function Input({ id, label, ...rest }: Props) {
	return (
		<div className="inline-flex flex-col gap-1">
			<label htmlFor={id} className="text-sm">
				{label}
			</label>
			<input
				id={id}
				{...rest}
				className="h-10 rounded-md border border-border bg-transparent px-2 text-sm transition-colors_opacity focus-visible:border-input focus-visible:outline-none"
			/>
		</div>
	);
}
