"use client";

import {
	useId,
	useRef,
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useDelayedToggleState } from "~/utils/hooks";
import { SelectProvider } from "~/app/_components/form/Select/context";

import Label from "~/app/_components/form/Label";
import SelectSheet, { type Position } from "~/app/_components/form/Select/Sheet";
import SelectTrigger from "~/app/_components/form/Select/Trigger";

type Props = {
	label: string;
	placeholder: string;
	children: ReactNode;
};

export default function Select({ label, placeholder, children }: Props) {
	const sheetId = useId();
	const inputId = useId();

	const buttonRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	const initialPos = useRef<Position>({ top: 0, right: 0, width: 0, maxHeight: 0 });
	const [isOpen, shouldRender, open] = useDelayedToggleState(false);

	const onClick: MouseEventHandler<HTMLButtonElement | HTMLDivElement> = (e) => {
		e.preventDefault();

		const bounding = e.currentTarget.getBoundingClientRect();

		const childrenLength = children ? (Array.isArray(children) ? children.length : 1) : 0;
		const renderHeight = childrenLength * 32 + 8;

		const availableSpace = window.innerHeight - bounding.bottom;
		const maxRenderHeight = Math.min(renderHeight, availableSpace - 72);
		const top = bounding.bottom + 12;

		// TODO(Curstantine): Implement bottom positioning for instances
		// where the area till the bottom of the screen is not enough
		// to render the dropdown.
		initialPos.current = {
			right: document.documentElement.clientWidth - bounding.right,
			maxHeight: maxRenderHeight,
			width: e.currentTarget.clientWidth,
			top: top,
		};

		open((prev) => !prev);
	};

	const onBlur: FocusEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();

		const related = e.relatedTarget as HTMLElement | null;
		const contains =
			buttonRef.current?.contains(related) || dialogRef.current?.contains(related);
		if (contains) return;

		open(false);
	};

	return (
		<SelectProvider open={open}>
			<div className="flex flex-col gap-1">
				<Label htmlFor={inputId}>{label}</Label>
				<SelectTrigger
					ref={buttonRef}
					sheetId={sheetId}
					inputId={inputId}
					onClick={onClick}
					onBlur={onBlur}
					isOpen={isOpen}
					placeholder={placeholder}
				/>
			</div>

			{shouldRender &&
				createPortal(
					<SelectSheet
						id={sheetId}
						ref={dialogRef}
						show={isOpen}
						onBlur={onBlur}
						position={initialPos}
					>
						{children}
					</SelectSheet>,
					document.body,
				)}
		</SelectProvider>
	);
}
