import Image from "next/image";

import { PAPER_URL, GITHUB_REPO } from "~/constants";

import { Spring, CurvedSpring } from "~/app/_components/Spring";
import SideContentSection from "~/app/_components/SideContentSection";
import FeatureCard from "~/app/_components/card/FeatureCard";
import MemberCard, { Props as MemberData } from "~/app/_components/card/MemberCard";

import Logo from "~/app/_components/icons/Logo";
import LinkIcon from "~/app/_components/icons/material/Link";

import LandingZeroImage from "~/app/assets/landing-0.jpg";
import LandingOneImage from "~/app/assets/landing-1.png";
import LandingTwoImage from "~/app/assets/landing-2.png";
import LandingThreeImage from "~/app/assets/landing-3.png";
import LandingFourImage from "~/app/assets/landing-4.png";
import ProfileKirushna from "~/app/assets/members/kirushna.jpeg";
import ProfileRachala from "~/app/assets/members/rachala.jpg";
import ProfileStephanie from "~/app/assets/members/Stephanie.jpg";
import ProfileFayaza from "~/app/assets/members/fayaza.png";
import ProfileLihini from "~/app/assets/members/lihini.png";
import GithubLogo from "~/app/_components/icons/GithubLogo";

const TEAM: MemberData[] = [
	{
		name: "Rachala Ovin",
		role: "Developer / Designer",
		image: ProfileRachala,
		links: {
			github: "https://github.com/Curstantine",
			linkedin: "https://www.linkedin.com/in/curstantine/",
		},
	},
	{
		name: "Vijayabalan Kirushnabalan",
		role: "Backend Developer / Designer",
		image: ProfileKirushna,
		links: {
			github: "https://github.com/Kirushnabalan",
			linkedin: "http://www.linkedin.com/in/kirushnabalan",
		},
	},
	{
		name: "Stephanie Benedict",
		role: "Backend Developer / Marketing",
		links: {
			linkedin: "https://www.linkedin.com/in/benedict-stephanie/",
			github: "https://github.com/Stephanie12-ben",
		},
		image: ProfileStephanie,
	},
	{
		name: "Lihini Nayanathara Hewavissa",
		role: "Frontend Developer",
		links: {
			linkedin: "https://www.linkedin.com/in/lihini-nayanathara-3372ab2b4",
		},
		image: ProfileLihini,
	},
	{
		name: "Mohamed Jiffry Fathima Fayaza",
		role: "ML Engineer / Data Scientist",
		links: {
			linkedin: "http://www.linkedin.com/in/fayazamjf8",
		},
		image: ProfileFayaza,
	},
	{
		name: "Sheruka Caiden Perera",
		role: "ML Assist / Data Scientist",
		links: {},
	},
];

export default function Page() {
	return (
		<main className="px-8 py-24 2xl:container 2xl:px-0">
			<section id="problem" className="grid min-h-[28rem] gap-12 lg:grid-cols-2">
				<div className="flex flex-col">
					<Image
						src={LandingZeroImage}
						alt="Landing Zero Image"
						title="Courtesy of Unsplash"
						className="rounded-lg shadow-md"
					/>
					<span className="mt-1 text-xs text-muted-foreground">
						Courtesy of{" "}
						<a
							className="underline"
							href="https://unsplash.com/@onthesearchforpineapples?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
						>
							Colin Lloyd
						</a>{" "}
						on{" "}
						<a
							className="underline"
							href="https://unsplash.com/photos/man-in-black-jacket-holding-white-and-orange-signage-during-daytime-mPxbXzL1_2E?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
						>
							Unsplash
						</a>
					</span>
				</div>

				<SideContentSection
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
						<LinkIcon className="mb-2.5 ml-0.5 inline size-3.5" />
					</a>
				</SideContentSection>
			</section>

			<section
				id="solution"
				className="mt-16 grid min-h-[28rem] items-center gap-6 lg:mt-0 lg:grid-cols-2 lg:gap-12"
			>
				<SideContentSection
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
						<CurvedSpring className="absolute -top-9 -left-2 -z-10 h-9 w-12 -scale-x-100 -rotate-45 sm:-top-10 sm:left-0 sm:h-10" />
						<Spring className="absolute -top-10 left-6 -z-10 h-9 w-12 sm:-top-12 sm:left-8 sm:h-10" />
						<CurvedSpring className="absolute -top-9 -right-2 -z-10 h-9 w-12 rotate-45 sm:-top-10 sm:right-0 sm:h-10" />
					</span>{" "}
					picture
				</h1>

				<FeatureCard
					src={LandingTwoImage}
					label="Event summarization"
					description="Summarized news events provide a comprehensive overview of the most important information."
				/>

				<FeatureCard
					src={LandingThreeImage}
					label="News source aggregation and analysis"
					description="Aggregation from multiple sources, with bias detection and credibility scoring."
				/>

				<FeatureCard
					src={LandingFourImage}
					label="Credibility rankings"
					description="Credibility rankings for news sources, articles, and authors."
				/>
			</section>

			<section
				id="team"
				className="mt-24 grid justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3"
			>
				<h1 className="col-span-full text-center text-3xl font-semibold sm:text-4xl">
					People behind the project
				</h1>

				{TEAM.map((member, index) => (
					<MemberCard
						key={index}
						name={member.name}
						role={member.role}
						image={member.image}
						links={member.links}
					/>
				))}
			</section>

			<section
				id="open-source"
				className="mx-auto mt-24 flex max-w-3xl flex-col items-center gap-2 rounded-md border border-border px-6 py-4"
			>
				<h1 className="text-center text-3xl font-semibold">We are now open source!</h1>
				<div className="max-w-prose text-center text-pretty">
					<p>
						As part of our mission to improve the transparency between us and the user,
						TrueLens is fully open-source. You are welcomed to report bugs, feature
						requests, or even contribute as a developer.
					</p>
				</div>
				<a href={GITHUB_REPO} className="mt-2 inline-flex items-center gap-2 text-primary">
					<GithubLogo className="size-7" />
					Check the repostory
				</a>
			</section>
		</main>
	);
}
