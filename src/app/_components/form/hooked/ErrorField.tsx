import clsx from "clsx/lite";
import { type Control, type FieldPath, type FieldValues, useFormState } from "react-hook-form";

type Props<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> = {
	control: Control<T>;
	name: N;
	className?: string;
};

export default function ErrorField<T extends FieldValues, N extends FieldPath<T>>({
	control,
	name,
	className,
}: Props<T, N>) {
	const { errors } = useFormState({ control, name });
	const error = errors[name];

	return (
		<span
			className={clsx(
				"text-destructive h-0 text-xs opacity-0 transition-opacity",
				error && "h-3 opacity-100",
				className,
			)}
		>
			{error?.message?.toString()}
		</span>
	);
}
