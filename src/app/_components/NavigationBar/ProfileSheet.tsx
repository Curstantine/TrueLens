"use client";

import clsx from "clsx";
import {
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
	type RefObject,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { useDelayedToggleState } from "@jabascript/react/client";

import { ListItemButton, ListItemLink } from "~/app/_components/list/ListItem";

import LogoutRoundedIcon from "~/app/_components/icons/material/LogoutRounded";
import PersonOutlineRoundedIcon from "~/app/_components/icons/material/PersonOutlineRounded";
import SettingsOutlineRounded from "~/app/_components/icons/material/SettingsOutlineRounded";

type Props = { name: string; email: string; children: ReactNode };

export default function ProfileSheet({ name, email, children }: Props) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	const initialPos = useRef({ top: 0, right: 0 });
	const [isOpen, shouldRender, open] = useDelayedToggleState(false);

	const onClick: MouseEventHandler<HTMLButtonElement | HTMLDivElement> = (e) => {
		e.preventDefault();

		const { top, right, height } = e.currentTarget.getBoundingClientRect();
		initialPos.current = {
			top: top + height + 24,
			right: document.documentElement.clientWidth - right,
		};

		open((prev) => !prev);
	};

	const onBlur: FocusEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();

		const related = e.relatedTarget as HTMLElement | null;
		if (related !== null) return;

		open(false);
	};

	return (
		<button
			ref={buttonRef}
			type="button"
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			aria-controls="nav-profile-sheet"
			onClick={onClick}
			onBlur={onBlur}
		>
			{children}
			{shouldRender &&
				createPortal(
					<Sheet
						ref={dialogRef}
						name={name}
						email={email}
						initial={initialPos}
						onBlur={onBlur}
						show={isOpen}
					/>,
					document.body,
					"nav-profile-sheet",
				)}
		</button>
	);
}

type SheetProps = Omit<Props, "children"> & {
	ref: RefObject<HTMLDivElement>;
	show: boolean;
	initial: RefObject<{ top: number; right: number }>;
	onBlur: FocusEventHandler<unknown>;
};

function Sheet({ ref, show, name, email, initial, onBlur }: SheetProps) {
	return (
		<div
			ref={ref}
			role="dialog"
			tabIndex={-1}
			id="nav-profile-sheet"
			style={{ top: initial.current?.top, right: initial.current?.right }}
			onClick={(e) => e.stopPropagation()}
			onBlur={onBlur}
			className={clsx(
				"fixed w-72 rounded-md border border-border bg-background py-3 shadow-lg transition-opacity",
				show ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<div className="inline-flex flex-col px-4 pb-3">
				<span aria-label="Your name" className="leading-tight font-medium">
					{name}
				</span>
				<span aria-label="Your email" className="text-sm text-muted-foreground">
					{email}
				</span>
			</div>

			<ul className="">
				<ListItemLink href="/profile" label="Profile" icon={PersonOutlineRoundedIcon} />
				<ListItemLink href="/settings" label="Settings" icon={SettingsOutlineRounded} />
				<ListItemButton
					label="Sign out"
					icon={LogoutRoundedIcon}
					onClick={() => signOut()}
				/>
			</ul>
		</div>
	);
}
