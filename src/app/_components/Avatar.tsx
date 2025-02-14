"use client";

import clsx from "clsx/lite";
import Image from "next/image";
import { useState } from "react";

type Props = {
	avatarUrl: string | null | undefined;
	alt: string;
	initials: string;
	className?: string;
};

export default function Avatar({ avatarUrl, alt, initials, className }: Props) {
	const [shouldShow, show] = useState(!!avatarUrl);

	return (
		<div className={clsx("bg-muted grid size-10 place-items-center rounded-full", className)}>
			{shouldShow && avatarUrl ? (
				<Image
					src={avatarUrl}
					alt={alt}
					width={40}
					height={40}
					className="size-10 rounded-full"
					unoptimized
					draggable={false}
					onError={() => show(false)}
				/>
			) : (
				<span className="text-muted-foreground select-none">{initials ?? alt}</span>
			)}
		</div>
	);
}
