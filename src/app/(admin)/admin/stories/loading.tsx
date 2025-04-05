import { StoryTableSkeleton } from "~/app/_components/_admin/StoryTable/Skeleton";

export default function Loading() {
	return (
		<main className="space-y-4 pt-4 pl-6">
			<h1 className="text-2xl font-semibold">Stories</h1>
			<StoryTableSkeleton />
		</main>
	);
}
