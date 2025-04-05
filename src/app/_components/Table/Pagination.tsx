import type { Table } from "@tanstack/react-table";

import ArrowRightAltRoundedIcon from "~/app/_components/icons/material/ArrowRightAltRounded";

type TablePaginationProps<T> = {
	table: Table<T>;
	totalData: number;
	pageIndex: number;
	isLoading: boolean;
};

export default function TablePagination<T>({
	table,
	totalData,
	pageIndex,
	isLoading,
}: TablePaginationProps<T>) {
	return (
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
				aria-disabled={isLoading}
				className="text-sm text-muted-foreground aria-disabled:opacity-50"
			>
				Showing {pageIndex}-{table.getPageCount()} of {totalData} stories
			</span>
		</div>
	);
}
