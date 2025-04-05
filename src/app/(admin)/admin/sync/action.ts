"use server";

import { headers } from "next/headers";

import { getBaseUrl } from "~/utils/url";

export async function startSync() {
	const heads = new Headers(await headers());

	fetch(getBaseUrl() + "/api/sync", {
		method: "POST",
		headers: heads,
	});
}
