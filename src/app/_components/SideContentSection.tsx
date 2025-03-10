import type { ReactNode } from "react";

type Props = {
	title: ReactNode;
	description: string[];
	children?: ReactNode;
};

export default function SideContentSection({ title, description, children }: Props) {
	return (
		<div className="flex max-w-prose flex-col text-pretty">
			<h2 className="mb-4 text-3xl font-semibold md:text-4xl">{title}</h2>
			{description.map((desc, i) => (
				<p key={i} className="mb-2">
					{desc}
				</p>
			))}
			{children}
		</div>
	);
}
