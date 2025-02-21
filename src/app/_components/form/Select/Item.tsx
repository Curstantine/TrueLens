"use client";

import type { ComponentType, SVGProps } from "react";

import { useSelect } from "~/app/_components/form/Select/context";

type Props = { value: string; label: string; icon?: ComponentType<SVGProps<SVGSVGElement>> };

export default function SelectItem({ value, label, icon: Icon }: Props) {
	const { selected, select } = useSelect();

	return (
		<div
			role="option"
			aria-selected={selected === value}
			onClick={() => select(value, label)}
			className="flex h-8 items-center px-3 text-sm text-foreground transition-colors select-none hover:bg-secondary/40 hover:text-secondary-foreground aria-selected:bg-secondary"
		>
			{Icon && <Icon className="mr-2" />}
			{label}
		</div>
	);
}
