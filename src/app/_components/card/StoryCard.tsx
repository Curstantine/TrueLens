import Image from "next/image";
import Link from "next/link";

type Props = {
	id: string;
	title: string;
	articleCount: number;
	factuality: number;
	cover: string | null;
};

export default function StoryCard({ id, title, cover, articleCount, factuality }: Props) {
	return (
		<Link
			draggable={false}
			href={`/story/${id}`}
			className="grid min-h-24 grid-cols-[1fr_--spacing(24)] items-center gap-4 rounded-md border border-border bg-background pl-3"
		>
			<div className="flex flex-grow flex-col gap-1 py-2">
				<span
					title={title}
					className="line-clamp-2 leading-tight font-semibold text-foreground"
				>
					{title}
				</span>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<span>AVG factuality - {factuality}%</span>
					<span>·</span>
					<span>Sources - {articleCount}</span>
				</div>
			</div>

			{cover && (
				<Image
					src={cover}
					alt="Story Image"
					quality={100}
					width={96}
					height={96}
					draggable={false}
					className="h-full w-fit rounded-r-md object-cover"
					unoptimized
				/>
			)}
		</Link>
	);
}
