import { describe, it, expect } from "vitest";
import { StoryStatus, UserRole } from "@prisma/client";

import {
	getInitials,
	asReadableUserRole,
	asReadableStoryStatus,
	toNameCase,
} from "~/utils/grammar"; // Replace with actual file path

describe("getInitials", () => {
	it('returns "N/A" for null or undefined input', () => {
		expect(getInitials(null)).toBe("N/A");
		expect(getInitials(undefined)).toBe("N/A");
	});

	it('returns "N/A" for empty string', () => {
		expect(getInitials("")).toBe("N/A");
	});

	it("returns first two characters for single name", () => {
		expect(getInitials("John")).toBe("JO");
		expect(getInitials("A")).toBe("A");
	});

	it("returns initials for first and last name", () => {
		expect(getInitials("John Doe")).toBe("JD");
		expect(getInitials("Mary Jane Smith")).toBe("MS");
	});

	it("handles names with extra spaces", () => {
		expect(getInitials("John  Doe")).toBe("JD");
	});
});

describe("asReadableUserRole", () => {
	it("converts UserRole enum to readable strings", () => {
		expect(asReadableUserRole(UserRole.ADMIN)).toBe("Admin");
		expect(asReadableUserRole(UserRole.MODERATOR)).toBe("Moderator");
		expect(asReadableUserRole(UserRole.USER)).toBe("User");
	});
});

describe("asReadableStoryStatus", () => {
	it("converts StoryStatus enum to readable strings", () => {
		expect(asReadableStoryStatus(StoryStatus.NEEDS_APPROVAL)).toBe("Needs Approval");
		expect(asReadableStoryStatus(StoryStatus.PUBLISHED)).toBe("Published");
	});
});

describe("toNameCase", () => {
	it("capitalizes first letter of each word and lowercases rest", () => {
		expect(toNameCase("john doe")).toBe("John Doe");
		expect(toNameCase("MARY JANE")).toBe("Mary Jane");
		expect(toNameCase("bOb SmItH")).toBe("Bob Smith");
	});

	it("handles single words", () => {
		expect(toNameCase("JOHN")).toBe("John");
		expect(toNameCase("smith")).toBe("Smith");
	});

	it("handles multiple spaces and special cases", () => {
		expect(toNameCase("john  doe")).toBe("John  Doe");
		expect(toNameCase("")).toBe("");
		expect(toNameCase("a")).toBe("A");
	});
});
