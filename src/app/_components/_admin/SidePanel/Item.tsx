"use client";

import clsx from "clsx/lite";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type ItemProps = { href: string; label: string; icon: ReactNode };

export default function AdminSidePanelItem({ href, label, icon }: ItemProps) {
	const pathname = usePathname();

	return (
		<Link
			href={href}
			className={clsx(
				"inline-flex h-8 w-full items-center gap-2 rounded-md px-2",
				pathname === href ? "bg-muted" : "hover:bg-muted/30 active:bg-muted/50",
			)}
		>
			{icon}
			{label}
		</Link>
	);
}
