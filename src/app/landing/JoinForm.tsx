"use client";

import { toast } from "sonner";

import { api } from "~/trpc/react";

import Button from "~/app/_components/form/Button";
import Input from "~/app/_components/form/Input";

export default function JoinForm() {
	const createWaitlist = api.waitlist.create.useMutation({
		onSuccess: () => {
			toast.success("You have successfully joined the waitlist!");
		},
	});

	return (
		<section className="mx-auto mt-16 mb-12 rounded-lg border border-secondary p-8 sm:mt-24 sm:max-w-xl">
			<h2 className="text-3xl font-semibold">Join the waitlist</h2>
			<span>Join the wait-list to get notified when TrueLens is released!</span>

			<form
				className="mt-6 flex flex-col gap-4"
				onSubmit={async (e) => {
					e.preventDefault();

					const data = new FormData(e.currentTarget);
					const email = data.get("email");
					createWaitlist.mutate({ email: email as string });
				}}
			>
				<Input id="email" type="email" label="Email" name="email" />
				<Button type="submit" disabled={createWaitlist.isPending} className="gap-2">
					{createWaitlist.isPending && (
						<div className="iconify tabler--loader-2 size-5 animate-spin" />
					)}
					{createWaitlist.isPending ? "Joining..." : "Join waitlist"}
				</Button>

				{createWaitlist.error && (
					<p className="-mt-2 text-xs text-destructive">{createWaitlist.error.message}</p>
				)}
			</form>
		</section>
	);
}
