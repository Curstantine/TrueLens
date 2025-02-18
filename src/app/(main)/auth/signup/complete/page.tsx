import type { Metadata } from "next";

import Button from "~/app/_components/Button";
import Input from "~/app/_components/Input";

export const metadata: Metadata = {
	title: "TrueLens - Complete your account",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Complete your account</h1>
				<span className="text-muted-foreground text-sm">
					Register an account on TrueLens to get started!
				</span>
			</div>

			<form className="flex flex-col gap-3">
				<div className="grid grid-cols-2 gap-2">
					<Input id="first_name" type="text" label="First Name" name="first_name" />
					<Input id="last_name" type="text" label="Last Name" name="last_name" />
				</div>

				<Input id="email" type="email" label="Email" name="email" disabled />
				<Input id="country" type="text" label="Country" name="country" />

				<Button type="submit" className="mt-4">
					Continue
				</Button>
			</form>
		</main>
	);
}
