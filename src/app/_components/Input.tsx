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
				className="bg-transparent transition-colors_opacity h-10 rounded-md border border-border px-2 focus-visible:border-input focus-visible:outline-none"
			/>
		</div>
	);
}
