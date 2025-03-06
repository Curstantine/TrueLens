import Link from "next/link";
import type { ComponentType, MouseEventHandler, ReactNode } from "react";

type ListItemLinkProps = {
	href: string;
	label: string;
	icon?: ComponentType<{ className: string }>;
};

export function ListItemLink({ href, label, icon: Icon }: ListItemLinkProps) {
	return (
		<li className="w-full">
			<Link
				href={href}
				className="flex h-11 items-center px-4 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-secondary-foreground"
			>
				{Icon && <Icon className="mr-3 size-6" />}
				{label}
			</Link>
		</li>
	);
}

type ListItemButtonProps = Omit<ListItemLinkProps, "href"> & {
	onClick: MouseEventHandler<HTMLButtonElement>;
};

export function ListItemButton({ label, icon: Icon, onClick }: ListItemButtonProps) {
	return (
		<li className="w-full">
			<button
				type="button"
				onClick={onClick}
				className="flex h-11 w-full cursor-pointer items-center px-4 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-secondary-foreground"
			>
				{Icon && <Icon className="mr-3 size-6" />}
				{label}
			</button>
		</li>
	);
}

export function ListItemValuePair({ title, value }: { title: string; value: ReactNode }) {
	return (
		<li className="flex justify-between">
			<span>{title}</span>
			<span>{value}</span>
		</li>
	);
}
