import { getInitials } from "~/utils/grammar";

import Avatar from "~/app/_components/Avatar";
import { DateSpan } from "~/app/_components/DateSpan";
import ArrowRightAltRoundedIcon from "~/app/_components/icons/material/ArrowRightAltRounded";
import FactualityLabel from "~/app/_components/FactualityLabel";

type Props = {
	title: string;
	summary: string;
	url: string;
	publishedAt: Date;
	publisherName: string;
	publisherLogo: string | null | undefined;
	factuality: number;
};

export default function ArticleCard({
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

			<div className="mt-2 flex items-center justify-between">
				<DateSpan value={publishedAt} className="text-xs text-muted-foreground" />

				<a href={url} target="_blank" rel="noreferrer noopener">
					<ArrowRightAltRoundedIcon className="size-5 text-muted-foreground" />
				</a>
			</div>
		</div>
	);
}
