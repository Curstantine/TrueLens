import type { SVGProps } from "react";

export default function DeleteOutlineRoundedIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={12}
			height={12}
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				fill="currentColor"
				d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"
			></path>
		</svg>
	);
}
