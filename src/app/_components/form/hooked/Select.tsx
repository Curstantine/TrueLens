import {
	Control,
	FieldPath,
	FieldValues,
	useController,
	UseControllerProps,
} from "react-hook-form";
import Select, { Props as SelectProps } from "~/app/_components/form/Select";

type Props<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> = Omit<
	SelectProps,
	"onValueChange"
> &
	Pick<UseControllerProps, "disabled" | "shouldUnregister"> & { control: Control<T>; name: N };

export default function HookedSelect<T extends FieldValues, N extends FieldPath<T>>({
	control,
	name,
	label,
	placeholder,
	children,
	disabled,
	shouldUnregister,
}: Props<T, N>) {
	const { field } = useController({
		control,
		name,
		disabled,
		shouldUnregister,
	});

	return (
		<Select label={label} placeholder={placeholder} onValueChange={field.onChange}>
			{children}
		</Select>
	);
}
