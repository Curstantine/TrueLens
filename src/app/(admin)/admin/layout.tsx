import type { ReactNode } from "react";

import AdminSidePanel from "~/app/_components/_admin/SidePanel";

type Props = {
	children: ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
	return (
		<div className="container grid grid-cols-[16rem_1fr]">
			<AdminSidePanel />
			{children}
		</div>
	);
}
