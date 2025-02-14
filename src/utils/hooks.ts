import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

/**
 * Creates a boolean where one gets delayed than the other whenever the setter is called.
 *
 * This useful for dialogs/popups where the content is inserted to the DOM, and the visibility is animated.
 *
 * ## Setter logic:
 * 1. When the `toggled` is true: `delayed` is delayed and the `toggled` is updated in the next render.
 * 2. When the current `delayed` is true: `toggled` is delayed and the `delayed` is updated in the next render.
 */
export function useDelayedToggleState(
	defaultValue: boolean,
	delay = 300,
): [boolean, boolean, Dispatch<SetStateAction<boolean>>] {
	const [toggled, setToggle] = useState(defaultValue);
	const [delayed, setDelayed] = useState(defaultValue);
	const setState = useCallback(
		(value: boolean | ((old: boolean) => boolean)) => {
			const x = typeof value === "function" ? value.call(undefined, toggled) : value;
			if (toggled) {
				setToggle(x);
				setTimeout(() => setDelayed(x), delay);
			} else {
				setDelayed(x);
				setTimeout(() => setToggle(x), 1);
			}
		},
		[delay, toggled],
	);

	return [toggled, delayed, setState] as const;
}

export function useOutOfBoundsHitToggle<E extends Element = Element>(
	ref: RefObject<E>,
	[state, setState]: [boolean, Dispatch<SetStateAction<boolean>>],
) {
	useEffect(() => {
		const onBoundClick = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setState(false);
		};

		if (state) {
			document.addEventListener("click", onBoundClick);
		}

		return () => {
			document.removeEventListener("click", onBoundClick);
		};
	}, [ref, state, setState]);
}
