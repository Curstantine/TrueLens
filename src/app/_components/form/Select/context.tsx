import {
	useContext,
	createContext,
	useState,
	useCallback,
	useRef,
	RefObject,
	useEffect,
	type ReactNode,
	Children,
} from "react";

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

type SelectProviderProps = {
	children: ReactNode;
	dialogChildren: ReactNode;
	defaultValue?: string;
	open: (arg0: boolean) => void;
	onValueChange?: (value: string) => void;
};

export function SelectProvider({
	children,
	dialogChildren,
	defaultValue,
	open,
	onValueChange,
}: SelectProviderProps) {
	const [selected, setSelected] = useState<string>("");
	const selectedLabel = useRef<string>("");

	const select = useCallback(
		(value: string, label: string) => {
			selectedLabel.current = label;
			setSelected(value);
			onValueChange?.call(null, value);
			open.call(null, false);
		},
		[onValueChange, open],
	);

	useEffect(() => {
		if (!defaultValue) return;
		const children = Children.toArray(dialogChildren);

		for (let i = 0; i < children.length; i++) {
			const xr = children[i];
			// @ts-expect-error - React node could have the props we are looking
			if (xr?.props?.value && xr?.props.label) {
				// @ts-expect-error - ^^ check already makes sure these exist
				const { value, label } = xr.props as { value: string; label: string };
				select(value, label);
				break;
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue]);

	return (
		<SelectContext.Provider value={{ selected, selectedLabel, select }}>
			{children}
		</SelectContext.Provider>
	);
}
