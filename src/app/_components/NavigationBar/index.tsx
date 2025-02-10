import Link from "next/link";
import Logo from "~/app/_components/icons/Logo";
import Search from "~/app/_components/Search";

export default function NavigationBar() {
	return (
		<nav className="container sticky top-0 flex h-14 items-center">
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
					<Link href="/contact">Pricing</Link>
				</li>

				<li>
					<Link
						href="/auth/signin"
						className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground"
					>
						Sign-in
					</Link>
				</li>
			</ul>
		</nav>
	);
}
