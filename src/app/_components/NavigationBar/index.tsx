import Link from "next/link";

import Logo from "~/app/_components/icons/Logo";
import Search from "~/app/_components/Search";

export default function NavigationBar() {
	return (
		<nav className="sticky top-0 container flex h-14 items-center">
			<Link href="/">
				<Logo className="h-8 w-fit" />
			</Link>

			<div className="grow" />

			<Search className="mr-6" />

			<ul className="inline-flex gap-4">
				<li>
					<Link href="/about">About</Link>
				</li>

				<li>
					<Link href="/contact">Plans</Link>
				</li>

				<li>
					<Link
						href="/auth/signin"
						className="bg-primary text-primary-foreground rounded-md px-4 py-1.5"
					>
						Sign-in
					</Link>
				</li>
			</ul>
		</nav>
	);
}
