import { useContext, createContext, useState, useCallback, useRef, RefObject } from "react";

type SelectState = {
	selected: string;
	selectedLabel: RefObject<string>;
	select: (value: string, label: string) => void;
};

const SelectContext = createContext<SelectState | null>(null);

export function useSelect() {
	const context = useContext(SelectContext);
	if (!context) throw new Error("useSelect must be used within a SelectProvider");
	return context;
}

export function SelectProvider({
	children,
	open,
}: {
	children: React.ReactNode;
	open: (arg0: boolean) => void;
}) {
	const [selected, setSelected] = useState<string>("");
	const selectedLabel = useRef<string>("");

	const select = useCallback(
		(value: string, label: string) => {
			selectedLabel.current = label;
			setSelected(value);
			open.call(null, false);
		},
		[open],
	);

	return (
		<SelectContext.Provider value={{ selected, selectedLabel, select }}>
			{children}
		</SelectContext.Provider>
	);
}
