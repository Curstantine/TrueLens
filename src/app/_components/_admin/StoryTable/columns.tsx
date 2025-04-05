import Link from "next/link";
import clsx from "clsx/lite";
import { StoryStatus } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "~/trpc/react";
import {
	BreakingStoryButton,
	DeleteStoryButton,
	EditLink,
} from "~/app/_components/_admin/StoryTable/ActionButtons";

export type StoryTableModel = RouterOutputs["story"]["getAll"]["docs"][0];

const columnHelper = createColumnHelper<StoryTableModel>();

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "2-digit",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

const storyTableColumns = [
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
				<DeleteStoryButton id={cell.row.original.id} />
				<EditLink id={cell.row.original.id} />
			</div>
		),
	}),
];

export default storyTableColumns;
