"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

import "lenis/dist/lenis.css";

export default function LenisWrapper({ children }: { children: ReactNode }) {
	return (
		<ReactLenis root options={{ autoRaf: true }}>
			{children}
		</ReactLenis>
	);
}
