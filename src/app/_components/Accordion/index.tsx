"use client";

import { memo, type ReactNode, useEffect, useRef, useState } from "react";

import { useAccordionContext } from "~/app/_components/Accordion/context";
import KeyboardArrowDownRoundedIcon from "~/app/_components/icons/material/KeyboardArrowDownRounded";

interface AccordionItemProps {
	value: string;
	title: string;
	children: ReactNode;
}

interface AccordionItemContentProps {
	children: ReactNode;
	value: string;
}

export { AccordionProvider as AccordionRoot } from "./context";

export const AccordionItem = memo(
	function AccordionItem({ value, title, children }: AccordionItemProps) {
		const { open } = useAccordionContext();
		return (
			<li
				role="presentation"
				className="flex cursor-pointer flex-col border-b border-border p-4 last:border-b-0"
				onClick={() => open(value)}
			>
				<AccordionToggle title={title} value={value} />
				{children}
			</li>
		);
	},
	(prev, next) => prev.value === next.value,
);

type AccordionToggleProps = { title: string; value: string };
function AccordionToggle({ title, value }: AccordionToggleProps) {
	const { opened } = useAccordionContext();
	const expanded = opened.includes(value);

	return (
		<button
			type="button"
			aria-expanded={expanded}
			className="group inline-flex items-center justify-between gap-4 text-left select-none"
		>
			<span className="text-sm font-semibold sm:text-base">{title}</span>
			<KeyboardArrowDownRoundedIcon className="size-6 text-muted-foreground transition-transform duration-emphasized-decelerate ease-emphasized-decelerate group-[[aria-expanded='true']]:rotate-180" />
		</button>
	);
}

export function AccordionItemContent({ children, value }: AccordionItemContentProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);

	const { opened } = useAccordionContext();
	const expanded = opened.includes(value);

	useEffect(() => {
		const calculateHeight = () => {
			if (ref.current) setHeight(ref.current.offsetHeight);
		};

		calculateHeight();
		window.addEventListener("resize", calculateHeight);
		return () => window.removeEventListener("resize", calculateHeight);
	}, []);

	return (
		<div
			role="region"
			aria-hidden={!expanded}
			className="overflow-hidden text-sm transition-[height,opacity] duration-emphasized-decelerate ease-emphasized-decelerate"
			style={{ height: expanded ? height : 0, opacity: expanded ? 1 : 0 }}
		>
			<div ref={ref} className="text-black-50 space-y-2 pt-2 text-sm">
				{children}
			</div>
		</div>
	);
}
