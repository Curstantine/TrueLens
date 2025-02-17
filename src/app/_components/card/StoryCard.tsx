import Image from "next/image";
import Link from "next/link";

type Props = {
	id: string;
	title: string;
	cover?: string;
};

export default function StoryCard({ id, title, cover }: Props) {
	return (
		<Link
			draggable={false}
			href={`/story/${id}`}
			className="flex flex-col gap-2 leading-tight hover:underline"
		>
			{cover !== undefined ? (
				<Image
					src={cover}
					alt=""
					quality={100}
					sizes="50vw"
					draggable={false}
					className="rounded-md"
				/>
			) : (
				<div className="bg-muted aspect-video size-full rounded-md"></div>
			)}

			{title}
		</Link>
	);
}
