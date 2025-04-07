import { toast } from "sonner";

import { getInitials } from "~/utils/grammar";
import { api } from "~/trpc/react";

import Avatar from "~/app/_components/Avatar";
import { DateSpan } from "~/app/_components/DateSpan";
import FactualityLabel from "~/app/_components/FactualityLabel";
import Button from "~/app/_components/form/Button";

import DeleteRoundedIcon from "~/app/_components/icons/material/DeleteRounded";

type Props = {
	id: string;
	title: string;
	summary: string;
	url: string;
	publishedAt: Date;
	publisherName: string;
	publisherLogo: string | null | undefined;
	factuality: number;
};

export default function AdminArticleCard({
	id,
	title,
	summary,
	url,
	publishedAt,
	publisherName,
	publisherLogo,
	factuality,
}: Props) {
	return (
		<div className="flex flex-col rounded-md border border-border p-3">
			<div className="inline-flex items-center gap-2">
				<Avatar
					avatarUrl={publisherLogo}
					alt={publisherName}
					initials={getInitials(publisherName)}
					className="!size-7 text-xs"
					rounded={false}
				/>
				<span className="text-sm text-muted-foreground">{publisherName}</span>
				<div className="flex-1" />
				<FactualityLabel factuality={factuality} />
			</div>

			<a href={url} target="_blank" className="my-1 font-semibold hover:underline">
				{title}
			</a>
			<p className="line-clamp-4 flex-1 text-sm text-ellipsis whitespace-break-spaces">
				{summary}
			</p>

			<div className="mt-2 flex items-end justify-between">
				<DateSpan value={publishedAt} className="text-xs text-muted-foreground" />
				<DeleteButton id={id} />
			</div>
		</div>
	);
}

type DeleteButtonProps = { id: string };
function DeleteButton({ id }: DeleteButtonProps) {
	const utils = api.useUtils();
	const deleteArticle = api.article.delete.useMutation({
		onSuccess: (input) => {
			utils.story.getById.invalidate({ id: input.storyId });
			utils.article.getAll.invalidate();
			toast.success("Article deleted successfully.");
		},
	});

	return (
		<Button
			type="button"
			intent="icon"
			className="w-9"
			onClick={() => deleteArticle.mutate({ id })}
		>
			<DeleteRoundedIcon className="size-5 text-destructive" />
		</Button>
	);
}
