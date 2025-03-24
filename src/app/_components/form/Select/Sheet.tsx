import clsx from "clsx/lite";
import type { FocusEventHandler, ReactNode, RefObject } from "react";

export type Position = { right: number; width: number; maxHeight: number } & (
	| { top: number }
	| { bottom: number }
);

type Props = {
	ref: RefObject<HTMLDivElement | null>;
	id: string;
	show: boolean;
	onBlur: FocusEventHandler<unknown>;
	position: RefObject<Position>;
	children: ReactNode;
};

export default function SelectSheet({ ref, id, show, position, onBlur, children }: Props) {
	return (
		<div
			ref={ref}
			role="listbox"
			id={id}
			tabIndex={-1}
			style={{
				// @ts-expect-error - react handles the union type correctly
				top: position.current?.top,
				// @ts-expect-error - react handles the union type correctly
				bottom: position.current?.bottom,
				right: position.current?.right,
				width: position.current?.width,

				maxHeight: position.current?.maxHeight,
			}}
			onClick={(e) => e.stopPropagation()}
			onBlur={onBlur}
			className={clsx(
				"absolute overflow-auto rounded-md bg-surface-1 py-2 shadow-lg transition-opacity",
				show ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			{children}
		</div>
	);
}
