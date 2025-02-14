"use client";

import { MouseEventHandler, type ReactNode, RefObject, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = { name: string; email: string; children: ReactNode };

export default function ProfileSheet({ name, email, children }: Props) {
	const [isOpen, open] = useState(false);
	const initialSheetPosition = useRef({ top: 0, right: 0 });

	const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();

		const { top, right, height } = e.currentTarget.getBoundingClientRect();
		initialSheetPosition.current = {
			top: top + height + 24,
			right: document.documentElement.clientWidth - right,
		};

		open((prev) => !prev);
	};

	return (
		<button
			type="button"
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			aria-controls="nav-profile-sheet"
			onClick={onClick}
		>
			{children}
			{isOpen &&
				createPortal(
					<Sheet name={name} email={email} initial={initialSheetPosition} />,
					document.body,
				)}
		</button>
	);
}

type SheetProps = Omit<Props, "children"> & {
	initial: RefObject<{ top: number; right: number }>;
};

function Sheet({ name, email, initial }: SheetProps) {
	return (
		<div
			role="dialog"
			tabIndex={-1}
			id="nav-profile-sheet"
			className="absolute"
			style={{ top: initial.current?.top, right: initial.current?.right }}
		>
			{name} {email}
		</div>
	);
}
