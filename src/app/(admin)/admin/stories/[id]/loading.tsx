import { InputEmptySkeleton, InputSkeleton } from "~/app/_components/form/Input";

export default async function Loading() {
	return (
		<main className="space-y-2 py-4 pl-6">
			<h1 className="text-2xl font-semibold">
				Edit Story #<span className="text-lg text-muted-foreground">....</span>
			</h1>

			<form className="flex flex-col gap-3">
				<div className="relative aspect-[16/3.5] w-full animate-pulse rounded-md bg-accent" />
				<InputSkeleton id="title" name="title" label="Title" />
				<fieldset className="flex flex-col">
					<legend className="mb-1 text-sm opacity-50">Summary</legend>
					<div className="grid gap-1">
						<InputEmptySkeleton id="summary-01" />
						<InputEmptySkeleton id="summary-02" />
						<InputEmptySkeleton id="summary-03" />
					</div>
				</fieldset>
			</form>
		</main>
	);
}
