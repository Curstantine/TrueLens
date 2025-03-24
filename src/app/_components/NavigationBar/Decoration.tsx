"use client";

import clsx from "clsx/lite";
import { useEffect, useState } from "react";

export default function NavBarDecoration() {
	const [isUnder, under] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 0) {
				under(true);
			} else {
				under(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			className={clsx(
				"absolute top-14 z-50 h-px w-full transition-colors duration-emphasized-decelerate ease-emphasized-decelerate",
				isUnder && "bg-border",
			)}
		/>
	);
}
