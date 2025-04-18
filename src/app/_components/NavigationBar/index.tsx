import Link from "next/link";
import { Suspense } from "react";
import NavBarDecoration from "~/app/_components/NavigationBar/Decoration";

import Search from "~/app/_components/NavigationBar/Search";
import SearchSkeleton from "~/app/_components/NavigationBar/SearchSkeleton";
import Profile, { ProfileSkeleton } from "~/app/_components/NavigationBar/Profile";

import Logo from "~/app/_components/icons/Logo";

export default function NavigationBar() {
	return (
		<nav className="sticky top-0 z-50 bg-background">
			<div className="flex h-14 items-center px-6 2xl:container">
				<Link href="/">
					<Logo className="h-8 w-fit" />
				</Link>

				<div className="grow" />

				<Suspense fallback={<SearchSkeleton />}>
					<Search />
				</Suspense>

				<ul className="mx-6 ml-4 hidden items-center gap-4 md:inline-flex">
					<li>
						<Link href="/about">About</Link>
					</li>

					<li>
						<Link href="/plans">Plans</Link>
					</li>
				</ul>

				<Suspense fallback={<ProfileSkeleton />}>
					<Profile />
				</Suspense>
			</div>

			<NavBarDecoration />
		</nav>
	);
}
