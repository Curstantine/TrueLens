"use client";

import clsx from "clsx";
import Link from "next/link";
import {
	type FocusEventHandler,
	type MouseEventHandler,
	type ReactNode,
	type RefObject,
	type ComponentType,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import PersonOutlineRoundedIcon from "~/app/_components/icons/material/PersonOutlineRounded";
import SettingsOutlineRounded from "~/app/_components/icons/material/SettingsOutlineRounded";

import { useDelayedToggleState } from "~/utils/hooks";

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
		if (related?.contains(buttonRef.current) || related?.contains(dialogRef.current)) return;

		// open(false);
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
				"bg-background absolute w-72 rounded-md py-3 shadow-lg transition-opacity",
				show ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<div className="inline-flex flex-col px-4 pb-3">
				<span aria-label="Your name" className="leading-tight font-medium">
					{name}
				</span>
				<span aria-label="Your email" className="text-muted-foreground text-sm">
					{email}
				</span>
			</div>

			<ul className="">
				<ListItemLink href="/profile" label="Profile" icon={PersonOutlineRoundedIcon} />
				<ListItemLink href="/settings" label="Settings" icon={SettingsOutlineRounded} />
			</ul>
		</div>
	);
}

type ListItemLinkProps = {
	href: string;
	label: string;
	icon?: ComponentType<{ className: string }>;
};

function ListItemLink({ href, label, icon: Icon }: ListItemLinkProps) {
	return (
		<li className="w-full">
			<Link
				href={href}
				className="hover:bg-secondary/40 text-muted-foreground hover:text-secondary-foreground flex h-11 items-center px-4 transition-colors"
			>
				{Icon && <Icon className="mr-3 size-6" />}
				{label}
			</Link>
		</li>
	);
}
