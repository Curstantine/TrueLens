import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "~/trpc/react";

import { EditLink, ExternalLink } from "~/app/_components/_admin/OutletTable/ActionButtons";

export type UserTableModel = RouterOutputs["newsOutlet"]["getAll"]["docs"][0];

const columnHelper = createColumnHelper<UserTableModel>();

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "2-digit",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

const userTableColumns = [
	columnHelper.accessor("name", {
		header: "Name",
		size: 500,
		cell: (cell) => (
			<Link href={`/admin/user/${cell.row.original.id}`} className="underline">
				{cell.getValue()}
			</Link>
		),
	}),
	columnHelper.accessor("_count.articles", { header: "Article #", size: 100 }),
	columnHelper.accessor("createdAt", {
		header: "Created At",
		minSize: 150,
		cell: (cell) => dateTimeFormatter.format(cell.getValue()),
	}),
	columnHelper.display({
		header: "Actions",
		size: 100,
		cell: (cell) => (
			<div className="mt-1 inline-flex gap-3">
				<ExternalLink href={cell.row.original.url} />
				<EditLink id={cell.row.original.id} />
			</div>
		),
	}),
];

export default userTableColumns;
