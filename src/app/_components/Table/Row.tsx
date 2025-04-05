import {
	type ColumnDefBase,
	flexRender,
	type Row,
	type StringHeaderIdentifier,
} from "@tanstack/react-table";

type RowProps<T> = { row: Row<T> };

export default function TableRow<T>({ row }: RowProps<T>) {
	return (
		<tr className="h-12 border-b border-border">
			{row.getVisibleCells().map((cell) => (
				<td key={cell.id} className="px-2 py-2 text-sm">
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>
			))}
		</tr>
	);
}

type StoryTableRowSkeletonProps = {
	columnDefs: (Pick<ColumnDefBase<unknown>, "size"> & StringHeaderIdentifier)[];
};
export function TableRowSkeleton({ columnDefs }: StoryTableRowSkeletonProps) {
	return (
		<tr className="h-12 border-b border-border">
			{columnDefs.map((x, i) => (
				<td key={i} className="px-2 py-2">
					<div className="h-3 animate-pulse rounded-full bg-muted" />
				</td>
			))}
		</tr>
	);
}
