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
	Pick<UseControllerProps, "disabled" | "shouldUnregister" | "defaultValue"> & {
		control: Control<T>;
		name: N;
	};

export default function HookedSelect<T extends FieldValues, N extends FieldPath<T>>({
	control,
	name,
	label,
	placeholder,
	children,
	disabled,
	shouldUnregister,
	defaultValue,
}: Props<T, N>) {
	const { field } = useController({
		control,
		name,
		disabled,
		shouldUnregister,
		defaultValue,
	});

	return (
		<Select
			label={label}
			placeholder={placeholder}
			defaultValue={defaultValue}
			onValueChange={field.onChange}
		>
			{children}
		</Select>
	);
}
