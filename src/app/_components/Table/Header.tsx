import {
	type ColumnDefBase,
	flexRender,
	type StringHeaderIdentifier,
	type Header,
} from "@tanstack/react-table";

type HeaderProps<T> = { header: Header<T, unknown> };

export default function TableHeader<T>({ header }: HeaderProps<T>) {
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

type TableHeaderSkeletonProps = {
	column: Pick<ColumnDefBase<unknown>, "size" | "maxSize"> & StringHeaderIdentifier;
};

export function TableHeaderSkeleton({ column }: TableHeaderSkeletonProps) {
	return (
		<th
			colSpan={1}
			className="h-12 border-b border-border px-2 text-left text-base"
			style={{ width: column.size, maxWidth: column.maxSize }}
		>
			{column.header}
		</th>
	);
}
