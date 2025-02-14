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
				className="border-border transition-colors_opacity focus-visible:border-input h-9 rounded-md border bg-transparent px-2 text-sm focus-visible:outline-hidden"
			/>
		</div>
	);
}
