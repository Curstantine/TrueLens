"use client";

import { api } from "~/trpc/react";

import CommentCard from "~/app/_components/card/CommentCard";
import CommentField from "~/app/_components/CommentSection/Field";

type Props = { storyId: string };

export default function CommentSection({ storyId }: Props) {
	const [comments, commentsQuery] = api.comment.getByStoryId.useSuspenseQuery({ storyId });

	return (
		<section className="mt-8">
			<h2 className="mb-2 inline-flex text-xl font-medium">
				<span>Comments</span>
				<span className="mt-1 ml-0.5 text-xs text-muted-foreground">
					({commentsQuery.data?.length ?? 0})
				</span>
			</h2>
			<CommentField storyId={storyId} />
			{comments.length === 0 && <p className="mt-2 text-muted-foreground">No comments yet</p>}
			<div className="mt-3 grid grid-cols-1 gap-4">
				{comments.map((comment) => (
					<CommentCard
						key={comment.id}
						userName={comment.user.name ?? "N/A"}
						userAvatar={comment.user.image}
						content={comment.content}
						createdAt={comment.createdAt}
					/>
				))}
			</div>
		</section>
	);
}
