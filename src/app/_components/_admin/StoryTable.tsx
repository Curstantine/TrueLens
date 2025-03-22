"use client";

import { keepPreviousData } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Header,
	Row,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";

import { api, type RouterOutputs } from "~/trpc/react";

const columnHelper = createColumnHelper<RouterOutputs["story"]["getAll"][0]>();

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
				<Link href={`/admin/stories/${cell.row.original.id}`}>
					<EditSquareOutlineRounded className="size-5" />
				</Link>
			</div>
		),
	}),
];

export default function StoryTable() {
	const storyQuery = api.story.getAll.useQuery(
		{ limit: 100, offset: 0, status: null },
		{ placeholderData: keepPreviousData },
	);

	const defaultData = useMemo(() => [], []);

	const table = useReactTable({
		columns,
		data: storyQuery.data ?? defaultData,
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
		</div>
	);
}

type HeaderProps = { header: Header<RouterOutputs["story"]["getAll"][0], unknown> };
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

type RowProps = { row: Row<RouterOutputs["story"]["getAll"][0]> };
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
