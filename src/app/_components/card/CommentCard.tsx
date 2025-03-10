"use client";

import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import type { MouseEventHandler } from "react";

import { getInitials } from "~/utils/grammar";
import { api } from "~/trpc/react";

import Avatar from "~/app/_components/Avatar";
import { DateTimeSpan } from "~/app/_components/DateSpan";
import Button from "~/app/_components/form/Button";
import { DeleteRoundedIcon } from "~/app/_components/icons/material/DeleteRounded";
import { LoaderIcon } from "~/app/_components/icons/Loader";

type Props = {
	id: string;
	userName: string;
	userAvatar: string | null;
	content: string;
	createdAt: Date;
	isCurrentUser?: boolean;
};

export default function CommentCard({
	id,
	userName,
	userAvatar,
	content,
	createdAt,
	isCurrentUser,
}: Props) {
	return (
		<div className="group relative flex flex-col gap-2">
			<div className="inline-flex items-center gap-2">
				<Avatar
					avatarUrl={userAvatar}
					alt={userName}
					initials={getInitials(userName)}
					className="!size-7 text-xs"
				/>
				<span className="text-sm text-muted-foreground">{userName}</span>

				<div className="flex flex-1 items-center justify-end">
					<DateTimeSpan value={createdAt} className="text-xs text-muted-foreground" />
				</div>
			</div>

			<p className="flex-1 text-sm whitespace-break-spaces">{content}</p>

			{isCurrentUser && <CommandBar commentId={id} />}
		</div>
	);
}

type CommandBarProps = { commentId: string };

function CommandBar({ commentId }: CommandBarProps) {
	const utils = api.useUtils();
	const deleteComment = api.comment.delete.useMutation({
		onSuccess: async () => {
			await utils.comment.invalidate();
		},
	});

	const handleDelete: MouseEventHandler<HTMLButtonElement> = async (e) => {
		e.preventDefault();

		try {
			await deleteComment.mutateAsync({ id: commentId });
		} catch (error) {
			if (error instanceof TRPCClientError) {
				return toast.error("Failed to delete comment", { description: error.message });
			}

			toast.error("Failed to delete comment", {
				description: "An unexpected error occurred",
			});
		}
	};

	return (
		<div className="absolute -bottom-2 flex h-16 w-full items-end justify-end bg-gradient-to-t from-background opacity-0 transition-opacity duration-emphasized-decelerate ease-emphasized-decelerate group-hover:opacity-100">
			<Button
				intent="destructiveBorder"
				className="!size-8 !p-0"
				aria-label="Delete comment"
				onClick={handleDelete}
				disabled={deleteComment.isPending}
			>
				{deleteComment.isPending ? (
					<LoaderIcon className="size-5 animate-spin" />
				) : (
					<DeleteRoundedIcon className="size-5" />
				)}
			</Button>
		</div>
	);
}
