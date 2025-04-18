import clsx from "clsx/lite";
import Image from "next/image";
import { ChangeEventHandler, MouseEventHandler, useState } from "react";
import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";

import Button from "~/app/_components/form/Button";
import ErrorField from "~/app/_components/form/hooked/ErrorField";
import { UploadButton } from "~/app/_components/_admin/form/CoverField";

import DeleteRoundedIcon from "~/app/_components/icons/material/DeleteRounded";
import UploadRoundedIcon from "~/app/_components/icons/material/UploadRounded";

type CoverFieldProps<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> = {
	control: Control<T>;
	name: N;
};

export default function AdminHookedLogoField<T extends FieldValues, N extends FieldPath<T>>({
	control,
	name,
}: CoverFieldProps<T, N>) {
	const [temp, setTemp] = useState<File | null>(null);
	const { field } = useController({ control, name });

	const hasImage = temp || field.value;

	const onFileSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setTemp(file);
	};

	const onRemove: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();

		if (temp) setTemp(null);
		else field.onChange(null);
	};

	const onUploadComplete = (url: string) => {
		setTemp(null);
		field.onChange(url);
	};

	return (
		<div className="space-y-1">
			<div
				className={clsx(
					"relative aspect-square w-full rounded-md",
					!hasImage && "border border-dashed border-input",
				)}
			>
				{hasImage && (
					<Image
						src={temp ? URL.createObjectURL(temp) : field.value!}
						fill
						alt="Cover"
						unoptimized={!!temp}
						className="rounded-md object-cover object-top"
					/>
				)}

				{hasImage && (
					<div className="absolute top-2 right-2 z-10">
						<Button type="button" intent="icon" onClick={onRemove} className="w-9">
							<DeleteRoundedIcon className="size-5 text-destructive" />
						</Button>
					</div>
				)}

				{temp && (
					<div className="absolute right-2 bottom-2 z-10">
						<UploadButton temp={temp} onUploadComplete={onUploadComplete} />
					</div>
				)}

				{!hasImage && (
					<label className="absolute inset-0 flex flex-col items-center justify-center">
						<UploadRoundedIcon className="size-8 text-primary" />
						<span className="text-center text-secondary-foreground">
							Drag & drop or click here to upload a logo
						</span>
						<input type="file" accept="image/*" hidden onChange={onFileSelect} />
					</label>
				)}
			</div>

			<ErrorField control={control} name={name} />
		</div>
	);
}
