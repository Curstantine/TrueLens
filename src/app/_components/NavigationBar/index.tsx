import Link from "next/link";
import { Suspense } from "react";

import Profile, { ProfileSkeleton } from "~/app/_components/NavigationBar/Profile";
import Search from "~/app/_components/form/Search";

import Logo from "~/app/_components/icons/Logo";

export default function NavigationBar() {
	return (
		<nav className="sticky top-0 z-50 bg-background">
			<div className="container flex h-14 items-center">
				<Link href="/">
					<Logo className="h-8 w-fit" />
				</Link>

				<div className="grow" />

				<Search className="mr-6" />

				<ul className="mr-6 inline-flex items-center gap-4">
					<li>
						<Link href="/about">About</Link>
					</li>

					<li>
						<Link href="/contact">Plans</Link>
					</li>
				</ul>

				<Suspense fallback={<ProfileSkeleton />}>
					<Profile />
				</Suspense>
			</div>
		</nav>
	);
}
