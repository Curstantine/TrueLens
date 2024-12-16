import Link from "next/link";
import { type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";

import { PAPER_URL } from "~/constants";

import JoinForm from "~/app/landing/JoinForm";
import Logo from "~/app/_components/icons/Logo";
import LenisWrapper from "~/app/_components/LenisWrapper";
import { Spring, CurvedSpring } from "~/app/_components/Spring";

import LandingOneImage from "~/app/assets/landing-1.png";
import LandingTwoImage from "~/app/assets/landing-2.png";
import LandingThreeImage from "~/app/assets/landing-3.png";
import LandingFourImage from "~/app/assets/landing-4.png";

export default function Page() {
	return (
		<LenisWrapper>
			<main className="container px-8 sm:px-0">
				<section className="flex min-h-screen flex-col items-center justify-center">
					<h1 className="text-center text-4xl font-semibold sm:text-5xl">
						Discern the truth from lies
						<span className="text-primary">...</span>
					</h1>
					<span>See the bigger picture clearly.</span>

					<div className="mt-6 inline-flex flex-col items-center justify-center gap-1">
						<span className="m-0 text-xs text-muted-foreground">Scroll down</span>
						<div className="iconify size-6 animate-bounce text-primary tabler--chevron-down" />
					</div>
				</section>

				<section id="problem" className="grid min-h-[28rem] gap-12 lg:grid-cols-2">
					<div className=""></div>
					<ContentSection
						title="The Problem with Legacy Media"
						description={[
							"In today's world, where misinformation is rampant, and legacy media platforms are increasingly influencing people, it is challenging to distinguish the truth from lies.",
							"Bias in the media affects everything from what events receive coverage, to how a news outlet frames those events in their reporting.",
							"While it is possible for people to resolve these issues by doing research, it requires tremendous effort to critically analyze the information regularly.",
						]}
					>
						<a
							href={PAPER_URL}
							target="_blank"
							className="text-sm text-secondary-foreground underline underline-offset-2"
						>
							Read our paper
							<div className="iconify mb-1 ml-0.5 size-3 tabler--external-link" />
						</a>
					</ContentSection>
				</section>

				<section
					id="solution"
					className="mt-16 grid min-h-[28rem] items-center gap-6 lg:mt-0 lg:grid-cols-2 lg:gap-12"
				>
					<ContentSection
						title={
							<div className="inline-flex items-center gap-2">
								<span className="text-2xl md:[font-size:inherit] md:[line-height:inherit]">
									Our solution:
								</span>
								<Logo className="mb-1 inline h-9 w-fit sm:h-12" />
							</div>
						}
						description={[
							"TrueLens is an innovative news platform designed to revolutionize how users consume and understand media content.",
							"By integrating advanced bias detection, comprehensive credibility scoring, and enhanced media transparency, TrueLens empowers users to navigate news sources with greater insight and critical awareness.",
						]}
					/>
					<Image
						src={LandingOneImage}
						alt="Landing One Image"
						className="rounded-lg shadow-md"
					/>
				</section>

				<section
					id="features"
					className="mt-24 grid justify-items-center gap-8 md:grid-cols-2 md:gap-x-6 lg:grid-cols-3"
				>
					<h1 className="col-span-full text-center text-3xl font-semibold sm:text-4xl">
						See the{" "}
						<span className="relative font-black">
							bigger
							<CurvedSpring className="absolute -left-2 -top-9 -z-10 h-9 w-12 -rotate-45 -scale-x-100 sm:-top-10 sm:left-0 sm:h-10" />
							<Spring className="absolute -top-10 left-6 -z-10 h-9 w-12 sm:-top-12 sm:left-8 sm:h-10" />
							<CurvedSpring className="absolute -right-2 -top-9 -z-10 h-9 w-12 rotate-45 sm:-top-10 sm:right-0 sm:h-10" />
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

				<JoinForm />
			</main>

			<footer className="flex flex-col bg-primary px-8">
				{/* <div className="container inline-flex h-8 items-center text-xs text-primary-foreground"> */}

				<div className="grid grid-cols-2 grid-rows-[2rem_2rem] items-center justify-items-center text-xs text-primary-foreground md:grid-cols-[1fr_auto_auto] md:grid-rows-[2rem] md:justify-items-start">
					<span className="order-3 col-span-full md:order-1 md:col-span-1">
						&copy; 2024 TrueLens Initiative. All Rights Reserved
					</span>
					<Link href="/consent/privacy" className="order-1 mr-8 md:order-2">
						Privacy Policy
					</Link>
					<Link href="/consent/terms" className="order-2 md:order-3">
						Terms of Service
					</Link>
				</div>
			</footer>
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
			<h2 className="mb-4 text-3xl font-semibold md:text-4xl">{title}</h2>
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
				quality={100}
				className="aspect-[16/10] w-fit self-center rounded-lg border border-secondary shadow-sm transition-shadow group-hover:shadow-md"
			/>
			<div className="mt-3 inline-flex max-w-[45ch] select-none flex-col text-base">
				<span className="font-semibold">{label}</span>
				<span className="text-sm text-secondary-foreground">{description}</span>
			</div>
		</div>
	);
}
