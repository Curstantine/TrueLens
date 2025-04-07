import { InputSkeleton } from "~/app/_components/form/Input";

export default async function Loading() {
	return (
		<main className="space-y-2 py-4 pl-6">
			<h1 className="text-2xl font-semibold">
				Edit Story #<span className="text-lg text-muted-foreground">....</span>
			</h1>

			<form className="grid grid-cols-[--spacing(64)_1fr] gap-3">
				<div className="aspect-square w-full animate-pulse rounded-md bg-accent" />

				<div className="flex flex-col gap-3">
					<InputSkeleton id="name" name="name" label="Name" />
					<InputSkeleton id="url" name="url" label="Site URL" />
				</div>
			</form>
		</main>
	);
}
