export function getInitials(name: string | null | undefined) {
	if (!name) return "N/A";

	const [firstName, lastName] = name.split(" ");

	if (!firstName && !lastName) return "N/A";
	if (firstName && !lastName) return firstName.substring(0, 2);

	return `${firstName?.at(0) ?? ""}${lastName?.at(0) ?? ""}`;
}
