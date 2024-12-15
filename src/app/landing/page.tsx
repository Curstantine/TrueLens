import { type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";

import { PAPER_URL } from "~/constants";

import Input from "~/app/_components/Input";
import Button from "~/app/_components/Button";
import LenisWrapper from "~/app/_components/LenisWrapper";

import LandingOneImage from "~/app/assets/landing-1.png";
import LandingTwoImage from "~/app/assets/landing-2.png";
import LandingThreeImage from "~/app/assets/landing-3.png";
import LandingFourImage from "~/app/assets/landing-4.png";

export default function Page() {
	return (
		<LenisWrapper>
			<main className="container">
				<section className="flex min-h-screen flex-col items-center justify-center">
					<h1 className="text-center text-5xl font-semibold">
						Discern the truth from lies
						<span className="text-primary">...</span>
					</h1>
					<span>See the bigger picture clearly.</span>

					<div className="mt-6 inline-flex flex-col items-center justify-center gap-1">
						<span className="m-0 text-xs text-muted-foreground">Scroll down</span>
						<div className="iconify tabler--chevron-down size-6 animate-bounce text-primary" />
					</div>
				</section>

				<section id="problem" className="grid min-h-[28rem] grid-cols-2 gap-12">
					<div className=""></div>
					<ContentSection
						title="The Problem with Legacy Media"
						description={[
							"Over the past decade, online news and ad-driven algorithms have made it profitable for news outlets to embrace a position on the bias spectrum to target specific consumers.",
							"Bias in the media affects everything from what events receive coverage, to how a news outlet frames those events in their reporting.",
							"As media outlets narrow their perspective and range of coverage, it's become impossible to consult a single news story for a well-rounded view on important issues.",
						]}
					>
						<a
							href={PAPER_URL}
							target="_blank"
							className="text-sm text-secondary-foreground underline underline-offset-2"
						>
							Read our paper
							<div className="iconify tabler--external-link mb-1 ml-0.5 size-3" />
						</a>
					</ContentSection>
				</section>

				<section
					id="solution"
					className="grid min-h-[28rem] grid-cols-2 items-center gap-12"
				>
					<ContentSection
						title="Our Solution: TrueLens"
						description={[
							"TrueLens is an innovative news platform designed to revolutionize how users consume and understand media content.",
							"By integrating advanced bias detection, comprehensive credibility scoring, and enhanced media transparency, TrueLens empowers users to navigate news sources with greater insight and critical awareness.",
						]}
					/>
					<Image
						src={LandingOneImage}
						alt="Landing One Image"
						className="rounded-lg shadow-lg"
					/>
				</section>

				<section
					id="features"
					className="mt-24 grid min-h-[28rem] grid-cols-3 justify-items-center"
				>
					<h1 className="col-span-full mb-8 text-center text-4xl font-semibold">
						See the{" "}
						<span className="relative font-bold">
							bigger
							<div className="absolute bottom-1 left-0 -z-10 h-1 w-full bg-primary" />
						</span>{" "}
						picture
					</h1>

					<PowerCard
						src={LandingTwoImage}
						label="Event summarization"
						description="Summarized news events provide a comprehensive overview of the most important information."
					/>

					<PowerCard
						src={LandingThreeImage}
						label="News source aggregation and analysis"
						description="Aggregation from multiple sources, with bias detection and credibility scoring."
					/>

					<PowerCard
						src={LandingFourImage}
						label="Credibility rankings"
						description="Credibility rankings for news sources, articles, and authors."
					/>
				</section>
			</main>

			<main className="mx-auto mb-12 mt-24 max-w-xl rounded-lg border border-secondary p-8">
				<h2 className="text-3xl font-semibold">Join the waitlist</h2>
				<span>Join the wait-list to get notified when TrueLens is released!</span>

				<form className="mt-6 flex flex-col gap-4">
					<Input id="email" type="email" label="Email" />
					<Button>Join waitlist</Button>
				</form>
			</main>

			<footer className=""></footer>
		</LenisWrapper>
	);
}

type ContentSectionProps = {
	title: ReactNode;
	description: string[];
	children?: ReactNode;
};

function ContentSection({ title, description, children }: ContentSectionProps) {
	return (
		<div className="flex max-w-prose flex-col text-pretty">
			<h2 className="mb-4 text-4xl font-semibold">{title}</h2>
			{description.map((desc, i) => (
				<p key={i} className="mb-2">
					{desc}
				</p>
			))}
			{children}
		</div>
	);
}

type PowerCardProps = {
	src: StaticImageData;
	label: string;
	description: string;
};

function PowerCard({ src, label, description }: PowerCardProps) {
	return (
		<div className="group flex flex-col">
			<Image
				src={src}
				alt=""
				aria-hidden
				className="h-72 w-fit self-center rounded-lg border border-secondary shadow-sm transition-shadow group-hover:shadow-md"
			/>
			<div className="mt-3 inline-flex max-w-[45ch] select-none flex-col text-base">
				<span className="font-semibold">{label}</span>
				<span className="text-sm text-secondary-foreground">{description}</span>
			</div>
		</div>
	);
}
