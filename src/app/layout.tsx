import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { env } from "~/env";

const InterFont = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "TrueLens",
	description: "Discern the truth from the noise, see the bigger picture.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${InterFont.variable}`}>
			{env.PROFILING && (
				<head>
					<script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
				</head>
			)}
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
				<Toaster />
			</body>
		</html>
	);
}
