import Image, { StaticImageData } from "next/image";
import Link from "next/link";

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
				className="hover:bg-muted/30 active:bg-muted/50 grid cursor-pointer grid-cols-[--spacing(12)_1fr] items-center gap-x-2 p-2 transition-colors"
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
					<div className="bg-muted size-12 rounded-full [grid-area:logo]" />
				)}
				{/* prettier-ignore */}
				<span className="leading-tight h-6 [grid-area:name]">#{place} {name}</span>
				<div className="text-muted-foreground inline-flex text-xs leading-tight [grid-area:credibility]">
					<span>{credibility}% Credibility</span>
					{/* prettier-ignore */}
					<span aria-hidden className="mx-1">•</span>
					<span className="">{publications} Publications</span>
				</div>
			</Link>
		</li>
	);
}
