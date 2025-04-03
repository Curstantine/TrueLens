import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin/Dashboard - TrueLens",
};

export default function Page() {
	return (
		<main className="space-y-4 pt-4 pl-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
		</main>
	);
}
