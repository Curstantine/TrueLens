import type { Control, FieldPath, FieldValues } from "react-hook-form";
import ErrorField from "~/app/_components/form/hooked/ErrorField";

import { InputInner, Props as InputProps } from "~/app/_components/form/Input";

type Props<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> = InputProps & {
	control: Control<T>;
	name: N;
};

export default function HookedInput<T extends FieldValues, N extends FieldPath<T>>({
	control,
	name,
	...rest
}: Props<T, N>) {
	return (
		<div role="presentation" className="inline-flex flex-col gap-1">
			<InputInner name={name} {...rest} />
			<ErrorField control={control} name={name} />
		</div>
	);
}
