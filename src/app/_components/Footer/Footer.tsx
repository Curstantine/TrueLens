import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import InstagramLogo from "~/app/_components/icons/InstagramLogo";
import LinkedinLogo from "~/app/_components/icons/LinkedinLogo";
import Logo from "~/app/_components/icons/Logo";
import MailOutlineIcon from "~/app/_components/icons/material/MailOutlineIcon";
import { GITHUB_REPO, PAPER_URL } from "~/constants";

type FooterLink = { label: string; href: string; out?: boolean };
type FooterIconLink = FooterLink & { icon: ComponentType<SVGProps<SVGSVGElement>> };

export const QUICK_LINKS: FooterLink[] = [
	{ label: "About", href: "/about" },
	{ label: "Methodology", href: PAPER_URL, out: true },
	{ label: "FAQs", href: "/about/faq" },
	{ label: "Source", href: GITHUB_REPO, out: true },
	{ label: "Plans", href: "/plans" },
];

export const CONTACT_LINKS: FooterIconLink[] = [
	{
		label: "truelens@gmail.com",
		href: "mailto:truelens@gmail.com",
		icon: MailOutlineIcon,
	},
	{ label: "@truelens.lk", href: "https://instagram.com/truelens.lk", icon: InstagramLogo },
	{
		label: "truelenslk",
		href: "https://www.linkedin.com/company/truelenslk",
		icon: LinkedinLogo,
	},
];

export default function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="flex flex-col items-start gap-6 px-6 py-8 md:flex-row md:gap-14 2xl:container 2xl:gap-28">
				<Logo className="h-fit w-40 lg:w-48" />
				<div className="flex-1" />

				<QuickLinks />
				<ContactUs />
			</div>

			<div className="bg-primary text-xs text-primary-foreground">
				<div className="flex flex-col items-center justify-between gap-2 px-6 py-2 md:h-7 md:flex-row md:gap-0 md:py-0 2xl:container">
					<p>© 2025 TrueLens Initiative. All Rights Reserved</p>
					<div className="flex space-x-4">
						<Link href="/policies/privacy" className="hover:underline">
							Privacy Policy
						</Link>
						<a href="/policies/tos" className="hover:underline">
							Terms of Service
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

function QuickLinks() {
	const className = "text-sm hover:underline";

	return (
		<div className="grid grid-cols-2 gap-2">
			<h2 className="col-span-2 font-medium text-foreground">Quick Links</h2>
			{QUICK_LINKS.map(({ label, href, out }) => {
				if (out) {
					return (
						<a key={label} href={href} target="_blank" className={className}>
							{label}
						</a>
					);
				}

				return (
					<Link key={label} href={href} className={className}>
						{label}
					</Link>
				);
			})}
		</div>
	);
}

function ContactUs() {
	return (
		<div className="grid grid-cols-1 gap-2">
			<h2 className="font-medium text-foreground">Contact</h2>
			{CONTACT_LINKS.map(({ label, href, icon: Icon }) => (
				<Link
					key={label}
					href={href}
					className="inline-flex items-center gap-1 text-sm hover:underline"
				>
					<Icon className="size-4" />
					<span>{label}</span>
				</Link>
			))}
		</div>
	);
}
