"use client";

import { keepPreviousData, skipToken } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Header,
	type PaginationState,
	Row,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { api, type RouterOutputs } from "~/trpc/react";

import ArrowRightAltRoundedIcon from "~/app/_components/icons/material/ArrowRightAltRounded";
import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";

type Model = RouterOutputs["story"]["getAll"]["docs"][0];

const columnHelper = createColumnHelper<Model>();

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "2-digit",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

const columns = [
	columnHelper.accessor("title", {
		header: "Title",
		size: 500,
		cell: (cell) => (
			<Link href={`/admin/stories/${cell.row.original.id}`} className="underline">
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
	columnHelper.accessor("modifiedAt", {
		header: "Last Modified",
		minSize: 150,
		cell: (cell) => dateTimeFormatter.format(cell.getValue()),
	}),
	columnHelper.display({
		header: "Actions",
		size: 100,
		cell: (cell) => (
			<div className="mt-1 inline-flex gap-3">
				<EditLink id={cell.row.original.id} />
			</div>
		),
	}),
];

type EditLinkProps = { id: string };
function EditLink({ id }: EditLinkProps) {
	const [hovered, setHovered] = useState(false);
	api.story.getById.usePrefetchQuery(hovered ? { id } : skipToken, {
		staleTime: 600000,
	});

	return (
		<Link
			href={`/admin/stories/${id}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<EditSquareOutlineRounded className="size-5" />
		</Link>
	);
}

export default function StoryTable() {
	const [pagination, page] = useState<PaginationState>({ pageIndex: 0, pageSize: 100 });
	const storyQuery = api.story.getAll.useQuery(
		{ limit: pagination.pageSize, offset: pagination.pageIndex, status: null },
		{ placeholderData: keepPreviousData },
	);

	const defaultData = useMemo(() => [], []);

	const table = useReactTable({
		columns,
		rowCount: storyQuery.data?.total,
		state: { pagination },
		data: storyQuery.data?.docs ?? defaultData,
		onPaginationChange: page,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
	});

	if (storyQuery.status !== "success") return <span>Loading</span>;

	return (
		<div>
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
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id} row={row} />
					))}
				</tbody>
			</table>
			<div className="flex items-center gap-4 px-2">
				<button
					type="button"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className="inline-flex h-10 items-center gap-1 text-sm disabled:opacity-50"
				>
					<ArrowRightAltRoundedIcon className="size-4 rotate-180 text-primary" />
					Prev
				</button>
				<button
					type="button"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className="inline-flex h-10 items-center gap-1 text-sm disabled:opacity-50"
				>
					Next
					<ArrowRightAltRoundedIcon className="size-4 text-primary" />
				</button>

				<div className="flex-1" />

				<span className="text-sm text-muted-foreground">
					Showing {pagination.pageIndex}-{pagination.pageSize} of {storyQuery.data.total}{" "}
					stories
				</span>
			</div>
		</div>
	);
}

type HeaderProps = { header: Header<Model, unknown> };

function TableHeader({ header }: HeaderProps) {
	return (
		<th
			colSpan={header.colSpan}
			className="h-12 border-b border-border px-2 text-left text-base"
			style={{ width: `${header.getSize()}px` }}
		>
			{header.isPlaceholder ? null : (
				<div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
			)}
		</th>
	);
}

type RowProps = { row: Row<Model> };

function TableRow({ row }: RowProps) {
	return (
		<tr className="h-12 border-b border-border">
			{row.getVisibleCells().map((cell) => {
				return (
					<td key={cell.id} className="px-2 py-2 text-sm">
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</td>
				);
			})}
		</tr>
	);
}
