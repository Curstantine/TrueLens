"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

import LinkIcon from "~/app/_components/icons/material/Link";
import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";

type EditLinkProps = { id: string };
export function EditLink({ id }: EditLinkProps) {
	api.newsOutlet.getById.usePrefetchQuery({ id }, { staleTime: 600000 });

	return (
		<Link href={`/admin/outlets/${id}`}>
			<EditSquareOutlineRounded className="size-5" />
		</Link>
	);
}

type ExternalLinkProps = { href: string };
export function ExternalLink({ href }: ExternalLinkProps) {
	return (
		<a href={href} target="_blank">
			<LinkIcon className="size-5" />
		</a>
	);
}
