"use client";

import clsx from "clsx/lite";
import Link from "next/link";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { StoryStatus } from "@prisma/client";
import { keepPreviousData } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Header,
	type PaginationState,
	Row,
	useReactTable,
} from "@tanstack/react-table";

import { api, type RouterOutputs } from "~/trpc/react";

import ArrowRightAltRoundedIcon from "~/app/_components/icons/material/ArrowRightAltRounded";
import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";
import PageHeaderOutlineRoundedIcon from "~/app/_components/icons/material/PageHeaderOutlineRounded";

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
	columnHelper.display({
		header: "#",
		size: 25,
		cell: (cell) => (
			<div
				className={clsx(
					"size-2 rounded-full",
					cell.row.original.status === StoryStatus.PUBLISHED
						? "bg-green-500"
						: "bg-yellow-500",
				)}
			/>
		),
	}),
	columnHelper.accessor("title", {
		header: "Title",
		size: 500,
		cell: (cell) => (
			<Link href={`/admin/stories/${cell.row.original.id}`} className="underline">
				{cell.getValue()}
			</Link>
		),
	}),
	columnHelper.accessor("articleCount", { header: "Article #", size: 100 }),
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
				<BreakingStoryButton id={cell.row.original.id} status={cell.row.original.status} />
				<EditLink id={cell.row.original.id} />
			</div>
		),
	}),
];

type EditLinkProps = { id: string };
function EditLink({ id }: EditLinkProps) {
	api.story.getById.usePrefetchQuery({ id }, { staleTime: 600000 });

	return (
		<Link href={`/admin/stories/${id}`}>
			<EditSquareOutlineRounded className="size-5" />
		</Link>
	);
}

type BreakingStoryButtonProps = Pick<EditLinkProps, "id"> & { status: StoryStatus };
function BreakingStoryButton({ id, status }: BreakingStoryButtonProps) {
	const utils = api.useUtils();
	const breakingStoryQuery = api.configuration.getBreakingStoryId.useQuery();
	const updateBreakingStory = api.configuration.updateBreakingStoryId.useMutation({
		onError: (e) => {
			toast.error("Failed to update breaking news", {
				description: e.message,
			});
		},
		onSuccess: () => {
			utils.configuration.getBreakingStoryId.invalidate();
			toast.success("Successfully updated breaking news");
		},
	});

	return (
		<button
			type="button"
			disabled={!breakingStoryQuery.data || status !== StoryStatus.PUBLISHED}
			data-selected={breakingStoryQuery.data === id}
			onClick={() => updateBreakingStory.mutate({ value: id })}
			className="transition-[opacity,color] disabled:opacity-50 data-[selected='true']:text-green-600"
		>
			<PageHeaderOutlineRoundedIcon className="size-5" />
		</button>
	);
}

export default function StoryTable() {
	const [pagination, page] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
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

				<span
					aria-disabled={!storyQuery.data}
					className="text-sm text-muted-foreground aria-disabled:opacity-50"
				>
					Showing {pagination.pageIndex}-{pagination.pageSize} of{" "}
					{storyQuery.data?.total ?? 0} stories
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
