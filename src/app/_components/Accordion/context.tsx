import { createContext, useCallback, useContext, useState } from "react";

type ContextData = { opened: string[]; open: (value: string) => void };
const AccordionContext = createContext<ContextData | null>(null);

export function useAccordionContext() {
	const context = useContext(AccordionContext);
	if (!context) throw new Error("AccordionContent must be used within AccordionRoot");

	return context;
}

export function AccordionProvider({ children }: { children: React.ReactNode }) {
	const [opened, setOpenItems] = useState<string[]>([]);
	const open = useCallback(
		(value: string) => {
			if (opened.includes(value)) {
				setOpenItems((prev) => prev.filter((v) => v !== value));
				return;
			}

			setOpenItems((prev) => [...prev, value]);
		},
		[opened],
	);

	return (
		<AccordionContext.Provider value={{ opened, open }}>
			<ul className="flex flex-col">{children}</ul>
		</AccordionContext.Provider>
	);
}
