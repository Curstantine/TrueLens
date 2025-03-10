import type { StaticImageData } from "next/image";
import Image from "next/image";

type Props = {
	src: StaticImageData;
	label: string;
	description: string;
};

export default function FeatureCard({ src, label, description }: Props) {
	return (
		<div className="group flex flex-col">
			<Image
				src={src}
				alt=""
				aria-hidden
				quality={100}
				className="aspect-16/10 w-fit self-center rounded-lg border border-secondary shadow-xs transition-shadow group-hover:shadow-md"
			/>
			<div className="mt-3 inline-flex max-w-[45ch] flex-col text-base select-none">
				<span className="font-semibold">{label}</span>
				<span className="text-sm text-secondary-foreground">{description}</span>
			</div>
		</div>
	);
}
