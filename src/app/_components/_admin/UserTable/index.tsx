"use client";

import { useMemo, useState } from "react";
import { type UserRole } from "@prisma/client";
import { keepPreviousData } from "@tanstack/react-query";
import { getCoreRowModel, type PaginationState, useReactTable } from "@tanstack/react-table";

import { api } from "~/trpc/react";
import userTableColumns from "~/app/_components/_admin/UserTable/columns";

import TableHeader from "~/app/_components/Table/Header";
import TableRow, { TableRowSkeleton } from "~/app/_components/Table/Row";
import UserTableFilter from "~/app/_components/_admin/UserTable/Filter";
import TablePagination from "~/app/_components/Table/Pagination";

export default function UserTable() {
	const [pagination, page] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
	const [role, setRole] = useState<UserRole | "all">("all");

	const storyQuery = api.user.getAll.useQuery(
		{
			limit: pagination.pageSize,
			offset: pagination.pageIndex,
			role: role === "all" ? undefined : role,
		},
		{ placeholderData: keepPreviousData },
	);

	const defaultData = useMemo(() => [], []);

	const table = useReactTable({
		columns: userTableColumns,
		rowCount: storyQuery.data?.total,
		state: { pagination },
		data: storyQuery.data?.docs ?? defaultData,
		onPaginationChange: page,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<UserTableFilter role={[role, setRole]} />
			<table className="w-full">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHeader key={header.id} header={header} />
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{storyQuery.status === "success"
						? table.getRowModel().rows.map((row) => <TableRow key={row.id} row={row} />)
						: Array.from({ length: 25 }, () => 0).map((_, i) => (
								// @ts-expect-error def error, we check for the correct types inside the component helper
								<TableRowSkeleton key={i} columnDefs={userTableColumns} />
							))}
				</tbody>
			</table>
			<TablePagination
				table={table}
				totalData={storyQuery.data?.total ?? 0}
				isLoading={storyQuery.status === "pending"}
				pageIndex={pagination.pageIndex}
			/>
		</div>
	);
}
