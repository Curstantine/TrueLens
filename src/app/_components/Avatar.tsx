"use client";

import clsx from "clsx/lite";
import Image from "next/image";
import { useState } from "react";

type Props = {
	avatarUrl: string | null | undefined;
	alt: string;
	initials: string;
	className?: string;
	rounded?: boolean;
};

export default function Avatar({ avatarUrl, alt, initials, className, rounded = true }: Props) {
	const [shouldShow, show] = useState(!!avatarUrl);

	return (
		<div
			className={clsx(
				"grid size-10 place-items-center",
				className,
				!shouldShow && "bg-muted",
				(!shouldShow || rounded) && "rounded-full",
			)}
		>
			{shouldShow && avatarUrl ? (
				<Image
					src={avatarUrl}
					alt={alt}
					width={56}
					height={56}
					className={clsx("size-full", rounded && "rounded-full")}
					draggable={false}
					onError={() => show(false)}
				/>
			) : (
				<span className="text-muted-foreground select-none">{initials ?? alt}</span>
			)}
		</div>
	);
}
