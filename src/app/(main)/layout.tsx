import type { ReactNode } from "react";

import Footer from "~/app/_components/Footer/Footer";
import NavigationBar from "~/app/_components/NavigationBar";

type Props = {
	children: ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
	return (
		<>
			<NavigationBar />
			<div className="flex-1">{children}</div>
			<Footer />
		</>
	);
}
