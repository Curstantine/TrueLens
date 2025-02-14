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
				className="bg-primary text-primary-foreground rounded-md px-4 py-1.5"
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
		<div className="bg-muted text-muted-foreground grid size-10 animate-pulse place-items-center rounded-full">
			<PersonOutlineRoundedIcon className="size-7" />
		</div>
	);
}
