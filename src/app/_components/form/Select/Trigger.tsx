import clsx from "clsx/lite";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { useSelect } from "~/app/_components/form/Select/context";

import KeyboardArrowDownRoundedIcon from "~/app/_components/icons/material/KeyboardArrowDownRounded";

type Props = Pick<
	DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
	"ref" | "onClick" | "onBlur"
> & { isOpen: boolean; sheetId: string; inputId: string; placeholder: string };

export default function SelectTrigger({
	ref,
	onClick,
	onBlur,
	sheetId,
	inputId,
	isOpen,
	placeholder,
}: Props) {
	const { selectedLabel } = useSelect();

	return (
		<button
			title={`Open ${placeholder}`}
			id={inputId}
			ref={ref}
			type="button"
			role="combobox"
			aria-controls={sheetId}
			aria-expanded={isOpen}
			onClick={onClick}
			onBlur={onBlur}
			className="border-border transition-colors_opacity aria-expanded:border-input flex h-9 items-center rounded-md border bg-transparent px-2 text-start text-sm disabled:opacity-75 aria-expanded:outline-hidden"
		>
			<span
				className={clsx(
					"pointer-events-none flex-1",
					selectedLabel.current ? "text-foreground" : "text-muted-foreground",
				)}
			>
				{selectedLabel.current || placeholder}
			</span>
			<KeyboardArrowDownRoundedIcon
				className={clsx(
					"text-muted-foreground size-5 transform transition-transform",
					isOpen ? "rotate-180" : "rotate-0",
				)}
			/>
		</button>
	);
}
