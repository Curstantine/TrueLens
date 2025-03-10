import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import InstagramLogo from "~/app/_components/icons/InstagramLogo";
import Logo from "~/app/_components/icons/Logo";
import MaterialSymbolsMailOutline from "~/app/_components/icons/material/MailLogo";

type FooterLink = { label: string; href: string };
type FooterIconLink = FooterLink & { icon: ComponentType<SVGProps<SVGSVGElement>> };

export const QUICK_LINKS: FooterLink[] = [
	{ label: "About", href: "/about" },
	{ label: "Mission", href: "/about/mission" },
	{ label: "FAQs", href: "/about/faqs" },
	{ label: "Methodology", href: "/about/methodology" },
	{ label: "Plans", href: "/plans" },
];

export const CONTACT_LINKS: FooterIconLink[] = [
	{ label: "Email", href: "mailto:truelens@gmail.com", icon: MaterialSymbolsMailOutline },
	{ label: "Instagram", href: "https://instagram.com/truelens", icon: InstagramLogo },
];

export default function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="container flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:gap-0">
				<Logo className="h-fit w-40 sm:w-48" />

				<QuickLinks />
				<ContactUs />
			</div>

			<div className="bg-primary text-xs text-primary-foreground">
				<div className="container flex flex-col items-center justify-between gap-2 py-2 md:h-7 md:flex-row md:gap-0 md:py-0">
					<p>© 2025 TrueLens Initiative. All Rights Reserved</p>
					<div className="flex space-x-4">
						<a href="#" className="hover:underline">
							Privacy Policy
						</a>
						<a href="#" className="hover:underline">
							Terms of Service
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

function QuickLinks() {
	return (
		<div className="grid grid-cols-2 gap-2">
			<h2 className="col-span-2 font-medium text-foreground">Quick Links</h2>
			{QUICK_LINKS.map(({ label, href }) => (
				<Link key={label} href={href} className="text-sm hover:underline">
					{label}
				</Link>
			))}
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
