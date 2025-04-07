import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "~/trpc/react";
import { asReadableUserRole } from "~/utils/grammar";

import {
	PromoteUserButton,
	EditLink,
	DemoteUserButton,
} from "~/app/_components/_admin/UserTable/ActionButtons";

export type UserTableModel = RouterOutputs["user"]["getAll"]["docs"][0];

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
	columnHelper.accessor("email", { header: "Email", size: 250 }),
	columnHelper.accessor("role", {
		header: "Role",
		minSize: 50,
		cell: (cell) => asReadableUserRole(cell.getValue()),
	}),
	columnHelper.accessor("createdAt", {
		header: "Created At",
		minSize: 200,
		cell: (cell) => dateTimeFormatter.format(cell.getValue()),
	}),
	columnHelper.display({
		header: "Actions",
		size: 100,
		cell: (cell) => (
			<div className="mt-1 inline-flex gap-3">
				<PromoteUserButton id={cell.row.original.id} role={cell.row.original.role} />
				<DemoteUserButton id={cell.row.original.id} role={cell.row.original.role} />
				<EditLink id={cell.row.original.id} />
			</div>
		),
	}),
];

export default userTableColumns;
