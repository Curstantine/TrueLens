import userTableColumns from "~/app/_components/_admin/UserTable/columns";

import { TableHeaderSkeleton } from "~/app/_components/Table/Header";
import { TableRowSkeleton } from "~/app/_components/Table/Row";
import { StoryTableFilterSkeleton } from "~/app/_components/_admin/StoryTable/Filter";

import ArrowRightAltRoundedIcon from "~/app/_components/icons/material/ArrowRightAltRounded";

export default function UserTableSkeleton() {
	return (
		<div>
			<StoryTableFilterSkeleton />
			<table className="w-full">
				<thead>
					<tr>
						{userTableColumns.map((x, i) => (
							// @ts-expect-error def error, we check for the correct types inside the component helper
							<TableHeaderSkeleton key={i} column={x} />
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: 25 }, () => 10).map((_, i) => (
						// @ts-expect-error def error, we check for the correct types inside the component helper
						<TableRowSkeleton key={i} columnDefs={userTableColumns} />
					))}
				</tbody>
			</table>
			<div className="flex items-center gap-4 px-2">
				<button
					type="button"
					disabled
					className="inline-flex h-10 items-center gap-1 text-sm disabled:opacity-50"
				>
					<ArrowRightAltRoundedIcon className="size-4 rotate-180 text-primary" />
					Prev
				</button>
				<button
					type="button"
					disabled
					className="inline-flex h-10 items-center gap-1 text-sm disabled:opacity-50"
				>
					Next
					<ArrowRightAltRoundedIcon className="size-4 text-primary" />
				</button>

				<div className="flex-1" />

				<span
					aria-disabled
					className="text-sm text-muted-foreground aria-disabled:opacity-50"
				>
					Showing 0-50 of 0 stories
				</span>
			</div>
		</div>
	);
}
