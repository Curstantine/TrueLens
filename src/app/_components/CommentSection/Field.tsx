"use client";

import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";

import { commentSchema } from "~/server/validation/comment";

import Button from "~/app/_components/form/Button";
import { SendRoundedIcon } from "~/app/_components/icons/material/SendRounded";
import ErrorField from "~/app/_components/form/hooked/ErrorField";

import LoaderIcon from "~/app/_components/icons/Loader";

type Props = { storyId: string };

export default function CommentField({ storyId }: Props) {
	const form = useForm<{ comment: string }>({
		resolver: zodResolver(commentSchema),
		defaultValues: { comment: "" },
	});

	const utils = api.useUtils();
	const { mutateAsync } = api.comment.create.useMutation({
		onSuccess: async () => {
			await utils.comment.invalidate();
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			await mutateAsync({ storyId, content: data.comment });
			form.reset();
		} catch (error) {
			if (error instanceof TRPCClientError) {
				return toast.error("Failed to submit comment", { description: error.message });
			}

			toast.error("Failed to submit comment", {
				description: "An unexpected error occurred",
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="grid grid-cols-[1fr_--spacing(12)] gap-2">
			<div className="flex flex-col">
				<textarea
					id="comment"
					placeholder="Write a comment..."
					spellCheck
					{...form.register("comment")}
					className="min-h-24 rounded-md border border-border bg-transparent p-2 text-sm transition-colors_opacity focus-visible:border-input focus-visible:outline-hidden disabled:opacity-50"
				/>
				<ErrorField control={form.control} name="comment" className="mt-1" />
			</div>
			<Button className="h-full" disabled={form.formState.isSubmitting}>
				{form.formState.isSubmitting ? (
					<LoaderIcon className="size-6 animate-spin" />
				) : (
					<SendRoundedIcon className="size-6" />
				)}
			</Button>
		</form>
	);
}
