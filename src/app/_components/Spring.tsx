import { type SVGProps } from "react";

type SpringProps = SVGProps<SVGSVGElement>;

export function Spring(props: SpringProps) {
	return (
		<svg
			width="19"
			height="31"
			viewBox="0 0 19 31"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M10.5 1.5V29.5M10.5 29.5C8.1 30.7 3.16667 24.6667 1 21.5M10.5 29.5C12.5 29.8794 16.8333 24.3248 18 21.5"
				stroke="#A81526"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

type CurvedSpringProps = SVGProps<SVGSVGElement>;

export function CurvedSpring(props: CurvedSpringProps) {
	return (
		<svg
			width="19"
			height="32"
			viewBox="0 0 19 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M10.5 1.5C6 9 10.5 30 10.5 30M10.5 30C8.1 31.2 3.16667 25.1667 1 22M10.5 30C12.5 30.3794 16.8333 24.8248 18 22"
				stroke="#A81526"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}
