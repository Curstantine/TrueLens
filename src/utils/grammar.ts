import { StoryStatus, UserRole } from "@prisma/client";

export function getInitials(name: string | null | undefined): string {
	if (!name?.trim()) return "N/A";

	const names = name.split(/\s+/).filter((x) => x.length > 0);
	if (names.length === 0) return "N/A";

	const first = names[0]!;
	const last = names[names.length - 1];

	if (names.length === 1 || last === undefined) {
		return first.slice(0, 2).toUpperCase();
	}

	return (first[0] + last[0]!).toUpperCase();
}

export function asReadableUserRole(role: UserRole) {
	switch (role) {
		case UserRole.ADMIN:
			return "Admin";
		case UserRole.MODERATOR:
			return "Moderator";
		case UserRole.USER:
			return "User";
	}
}
export function asReadableStoryStatus(status: StoryStatus) {
	switch (status) {
		case StoryStatus.NEEDS_APPROVAL:
			return "Needs Approval";
		case StoryStatus.PUBLISHED:
			return "Published";
	}
}

export function toNameCase(str: string) {
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
	);
}
