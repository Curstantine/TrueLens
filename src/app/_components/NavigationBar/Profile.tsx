import Link from "next/link";

import { getInitials } from "~/utils/grammar";
import { auth } from "~/server/auth";

import Avatar from "~/app/_components/Avatar";
import PersonOutlineRoundedIcon from "~/app/_components/icons/material/PersonOutlineRounded";
import ProfileSheet from "~/app/_components/NavigationBar/ProfileSheet";

export default async function Profile() {
	const session = await auth();

	if (!session) {
		return (
			<Link
				href="/auth/signin"
				className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground"
			>
				Sign-in
			</Link>
		);
	}

	return (
		<ProfileSheet name={session.user.name} email={session.user.email}>
			<Avatar
				avatarUrl={session.user.image}
				alt={`${session.user.name}'s avatar`}
				initials={getInitials(session.user.name)}
			/>
		</ProfileSheet>
	);
}

export function ProfileSkeleton() {
	return (
		<div className="grid size-10 animate-pulse place-items-center rounded-full bg-muted text-muted-foreground">
			<PersonOutlineRoundedIcon className="size-7" />
		</div>
	);
}
