import Image, { StaticImageData } from "next/image";
import GithubLogo from "~/app/_components/icons/GithubLogo";
import LinkedinLogo from "~/app/_components/icons/LinkedinLogo";

export type Props = {
	name: string;
	role: string;
	image?: StaticImageData;
	links: Partial<Record<"github" | "linkedin", string>>;
};

export default function MemberCard({ name, role, image, links }: Props) {
	return (
		<div
			style={{ gridTemplateAreas: `"image content" "image links"` }}
			className="grid w-full grid-cols-[--spacing(24)_1fr] grid-rows-[1fr_--spacing(8)] gap-x-4 rounded-lg border border-secondary px-3 py-2 shadow-xs transition-shadow group-hover:shadow-md"
		>
			<div className="size-24 rounded-md bg-muted [grid-area:image]">
				{image && (
					<Image
						src={image}
						alt={`${name}'s profile picture`}
						className="size-full rounded-md"
						quality={100}
						sizes="512px"
					/>
				)}
			</div>

			<div className="flex flex-col [grid-area:content]">
				<h2 className="font-medium">{name}</h2>
				<span className="text-sm text-muted-foreground">{role}</span>
			</div>

			<div className="mt-2 flex flex-wrap gap-2 text-primary [grid-area:links]">
				{links.github && (
					<a href={links.github} target="_blank" aria-label="Github">
						<GithubLogo className="size-6" />
					</a>
				)}
				{links.linkedin && (
					<a href={links.linkedin} target="_blank" aria-label="LinkedIn">
						<LinkedinLogo className="size-6" />
					</a>
				)}
			</div>
		</div>
	);
}
