import type { ReactNode } from "react";
import NavigationBar from "~/app/_components/NavigationBar";

type Props = {
	children: ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
	return (
		<>
			<NavigationBar />
			{children}
		</>
	);
}
