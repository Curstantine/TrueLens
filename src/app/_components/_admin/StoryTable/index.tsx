"use client";

import { StoryStatus } from "@prisma/client";
import { keepPreviousData } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getCoreRowModel, type PaginationState, useReactTable } from "@tanstack/react-table";

import { api } from "~/trpc/react";
import storyTableColumns from "~/app/_components/_admin/StoryTable/columns";

import TableHeader from "~/app/_components/Table/Header";
import TableRow, { TableRowSkeleton } from "~/app/_components/Table/Row";
import StoryTableFilter from "~/app/_components/_admin/StoryTable/Filter";
import TablePagination from "~/app/_components/Table/Pagination";

export default function StoryTable() {
	const [pagination, page] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
	const [status, setStatus] = useState<StoryStatus | "all">("all");

	const storyQuery = api.story.getAll.useQuery(
		{
			limit: pagination.pageSize,
			offset: pagination.pageIndex,
			status: status === "all" ? null : status,
			includeBreakingNews: true,
		},
		{ placeholderData: keepPreviousData },
	);

	const defaultData = useMemo(() => [], []);

	const table = useReactTable({
		columns: storyTableColumns,
		rowCount: storyQuery.data?.total,
		state: { pagination },
		data: storyQuery.data?.docs ?? defaultData,
		onPaginationChange: page,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<StoryTableFilter status={[status, setStatus]} />
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
								<TableRowSkeleton key={i} columnDefs={storyTableColumns} />
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
