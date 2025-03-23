import type { SVGProps } from "react";

export default function CommentOutlineIcon(props: SVGProps<SVGSVGElement>) {
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
				d="m22 22l-4-4H4q-.825 0-1.412-.587T2 16V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4zM4 16h14.85L20 17.125V4H4zm0 0V4z"
			></path>
		</svg>
	);
}
