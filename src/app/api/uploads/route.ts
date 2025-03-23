import { UserRole } from "@prisma/client";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";

export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;
	const user = await auth();

	if (!user || user.user.role !== UserRole.ADMIN) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				console.log("onBeforeGenerateToken", pathname, clientPayload);
				return {
					allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
					maximumSizeInBytes: 15 * 1024 * 1024,
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				console.log("blob upload completed", blob, tokenPayload);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message }, { status: 400 });
	}
}
