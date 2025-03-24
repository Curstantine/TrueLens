import { describe, test, expect } from "vitest";
import { getInitials } from "~/utils/grammar";

describe("getInitials", () => {
	test("returns N/A when name is null", () => {
		expect(getInitials(null)).toBe("N/A");
	});

	test("returns N/A when name is undefined", () => {
		expect(getInitials(undefined)).toBe("N/A");
	});

	test("returns N/A when name is empty string", () => {
		expect(getInitials("")).toBe("N/A");
	});

	test("returns first two letters of single name", () => {
		expect(getInitials("John")).toBe("Jo");
	});
});
