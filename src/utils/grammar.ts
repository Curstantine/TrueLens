import { StoryStatus } from "@prisma/client";

export function getInitials(name: string | null | undefined) {
	if (!name) return "N/A";

	const [firstName, lastName] = name.split(" ");

	if (!firstName && !lastName) return "N/A";
	if (firstName && !lastName) return firstName.substring(0, 2);

	return `${firstName?.at(0) ?? ""}${lastName?.at(0) ?? ""}`;
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
