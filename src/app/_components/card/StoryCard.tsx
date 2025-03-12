import Image from "next/image";
import Link from "next/link";

type Props = {
	id: string;
	title: string;
	noOfArticles: number;
	factuality: number;
	cover: string | null;
};

export default function StoryCard({ id, title, cover, noOfArticles, factuality }: Props) {
	return (
		<Link
			draggable={false}
			href={`/story/${id}`}
			className="grid grid-cols-[1fr_--spacing(24)] items-center gap-4 rounded-md border border-border bg-background pl-3"
		>
			<div className="flex flex-grow flex-col gap-1">
				<span className="leading-tight font-semibold text-foreground">{title}</span>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<span>Factuality - {factuality}</span>
					<span>·</span>
					<span>Sources - {noOfArticles}</span>
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
					className="size-24 rounded-r-md object-cover"
					unoptimized
				/>
			)}
		</Link>
	);
}
