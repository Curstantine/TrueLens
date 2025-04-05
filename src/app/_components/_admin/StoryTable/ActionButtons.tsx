"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { StoryStatus } from "@prisma/client";

import { api } from "~/trpc/react";

import DeleteOutlineRoundedIcon from "~/app/_components/icons/material/DeleteOutlineRounded";
import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";
import PageHeaderOutlineRoundedIcon from "~/app/_components/icons/material/PageHeaderOutlineRounded";

type EditLinkProps = { id: string };
export function EditLink({ id }: EditLinkProps) {
	api.story.getById.usePrefetchQuery({ id }, { staleTime: 600000 });

	return (
		<Link href={`/admin/stories/${id}`}>
			<EditSquareOutlineRounded className="size-5" />
		</Link>
	);
}

type BreakingStoryButtonProps = Pick<EditLinkProps, "id"> & { status: StoryStatus };
export function BreakingStoryButton({ id, status }: BreakingStoryButtonProps) {
	const utils = api.useUtils();
	const breakingStoryQuery = api.configuration.getBreakingStoryId.useQuery();
	const updateBreakingStory = api.configuration.updateBreakingStoryId.useMutation({
		onError: (e) => {
			toast.error("Failed to update breaking news", {
				description: e.message,
			});
		},
		onSuccess: () => {
			utils.configuration.getBreakingStoryId.invalidate();
			toast.success("Successfully updated breaking news");
		},
	});

	return (
		<button
			type="button"
			title="Update as breaking story"
			disabled={!breakingStoryQuery.data || status !== StoryStatus.PUBLISHED}
			data-selected={breakingStoryQuery.data === id}
			onClick={() => updateBreakingStory.mutate({ value: id })}
			className="transition-[opacity,color] disabled:opacity-50 data-[selected='true']:text-green-600"
		>
			<PageHeaderOutlineRoundedIcon className="size-5" />
		</button>
	);
}

type DeleteStoryButtonProps = Pick<BreakingStoryButtonProps, "id">;
export function DeleteStoryButton({ id }: DeleteStoryButtonProps) {
	const [confirmed, confirm] = useState(false);
	const utils = api.useUtils();
	const deleteStory = api.story.delete.useMutation({
		onError: (e) => {
			toast.error("Failed to delete the story", {
				description: e.message,
			});
		},
		onSuccess: ([, input]) => {
			utils.story.getAll.invalidate();
			utils.story.getById.invalidate({ id: input.id });
			utils.story.getByIdReduced.invalidate({ id: input.id });

			toast.success("Successfully deleted story");
		},
	});

	return (
		<button
			type="button"
			title="Delete story"
			data-confirmed={confirmed}
			onBlur={() => confirm(false)}
			onClick={() => {
				if (confirmed) deleteStory.mutate({ id });
				else {
					toast.warning("Press again to confirm the delete action");
					confirm(true);
				}
			}}
			className="transition-[opacity,color] data-[confirmed='true']:text-red-600"
		>
			<DeleteOutlineRoundedIcon className="size-5" />
		</button>
	);
}
