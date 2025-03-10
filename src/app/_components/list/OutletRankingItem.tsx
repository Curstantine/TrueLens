import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { getInitials } from "~/utils/grammar";

type OutletRankingItemProps = {
	place: number;
	name: string;
	credibility: number;
	publications: number;
	logo?: StaticImageData;
};

export default function OutletRankingItem({
	place,
	name,
	credibility,
	publications,
	logo,
}: OutletRankingItemProps) {
	return (
		<li>
			<Link
				href={`/outlet/${name}`}
				style={{ gridTemplateAreas: `"logo name" "logo credibility"` }}
				className="grid cursor-pointer grid-cols-[--spacing(12)_1fr] items-center gap-x-2 p-2 transition-colors hover:bg-muted/30 active:bg-muted/50"
			>
				{logo !== undefined ? (
					<Image
						src={logo}
						alt=""
						quality={100}
						sizes="256px"
						className="bg-fit h-fit w-10 [grid-area:logo]"
					/>
				) : (
					<div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground [grid-area:logo]">
						{getInitials(name)}
					</div>
				)}
				{/* prettier-ignore */}
				<span className="leading-tight h-6 [grid-area:name]">#{place} {name}</span>
				<div className="inline-flex text-xs leading-tight text-muted-foreground [grid-area:credibility]">
					<span>{credibility}% Credibility</span>
					{/* prettier-ignore */}
					<span aria-hidden className="mx-1">•</span>
					<span className="">{publications} Publications</span>
				</div>
			</Link>
		</li>
	);
}
