"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEventHandler, MouseEventHandler, use, useState, useTransition } from "react";
import {
	type Control,
	useController,
	useFieldArray,
	useForm,
	type UseFormRegister,
} from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import clsx from "clsx/lite";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { toast } from "sonner";

import { api, RouterOutputs } from "~/trpc/react";

import Button from "~/app/_components/form/Button";
import HookedInput from "~/app/_components/form/hooked/Input";
import ErrorField from "~/app/_components/form/hooked/ErrorField";

import DeleteRoundedIcon from "~/app/_components/icons/material/DeleteRounded";
import AddRoundedIcon from "~/app/_components/icons/material/AddRounded";
import UploadRoundedIcon from "~/app/_components/icons/material/UploadRounded";
import LoaderIcon from "~/app/_components/icons/Loader";

type Props = {
	params: Promise<{ id: string }>;
};

const VALIDATION = z.object({
	title: z.optional(z.string().min(1, "Title is required")),
	summary: z.optional(
		z
			.array(z.object({ value: z.string().min(1, "Summary is required") }))
			.min(1, "At least one summary is required"),
	),
	cover: z.optional(z.string()),
});

export default function Page({ params }: Props) {
	const { id } = use(params);
	const [data] = api.story.getById.useSuspenseQuery({ id });

	return (
		<main className="space-y-2 pt-4 pl-6">
			<h1 className="text-2xl font-semibold">
				Edit Story #<span className="text-lg text-muted-foreground">{data.id}</span>
			</h1>
			<Form data={data} />
		</main>
	);
}

type FormProps = { data: RouterOutputs["story"]["getById"] };
function Form({ data }: FormProps) {
	const router = useRouter();

	const utils = api.useUtils();
	const mutate = api.story.update.useMutation({
		onSuccess: (input) => {
			utils.story.getAll.invalidate();
			utils.story.getById.invalidate({ id: input.id });
		},
	});

	const { control, register, handleSubmit } = useForm({
		resolver: zodResolver(VALIDATION),
		defaultValues: {
			title: data.title,
			summary: data.summary.map((value) => ({ value })),
			cover: data.cover ?? undefined,
		},
	});

	const onSubmit = handleSubmit(async (result) => {
		await mutate.mutateAsync({
			id: data.id,
			title: result.title,
			summary: result.summary?.map((s) => s.value) ?? data.summary,
			cover: result.cover,
		});

		toast.success("Story updated successfully");
		router.push("/admin/stories");
	});

	return (
		<form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
			<CoverField control={control} />
			<HookedInput
				control={control}
				id="title"
				label="Title"
				defaultValue={data.title}
				{...register("title")}
			/>
			<SummaryFieldSet control={control} register={register} />
			<div className="inline-flex items-center justify-end gap-2">
				<Button intent="ghost" className="w-32" onClick={() => router.back()}>
					Back
				</Button>
				<Button type="submit" className="w-32">
					Submit
				</Button>
			</div>
		</form>
	);
}

type SummaryFieldSetProps = {
	control: Control<z.infer<typeof VALIDATION>>;
	register: UseFormRegister<z.infer<typeof VALIDATION>>;
};

function SummaryFieldSet({ control, register }: SummaryFieldSetProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "summary",
		rules: { minLength: 1 },
	});

	return (
		<fieldset className="flex flex-col">
			<legend className="mb-1 text-sm">Summary</legend>
			{fields.map((field, i) => (
				<div key={field.id} className="grid grid-cols-[1fr_--spacing(9)] gap-1">
					<HookedInput
						control={control}
						id={`summary.${i}.value`}
						className="col-span-full"
						defaultValue={field.value}
						{...register(`summary.${i}.value`)}
					/>
					{fields.length > 1 && (
						<Button intent="destructiveBorder" onClick={() => remove(i)}>
							<DeleteRoundedIcon className="size-5" />
						</Button>
					)}
				</div>
			))}
			<button
				type="button"
				onClick={() => append({ value: "" })}
				className="mt-1 inline-flex items-center self-center text-sm hover:underline"
			>
				<AddRoundedIcon className="size-4 text-primary" />
				Add Summary
			</button>
		</fieldset>
	);
}

type CoverFieldProps = { control: Control<z.infer<typeof VALIDATION>> };
function CoverField({ control }: CoverFieldProps) {
	const [temp, setTemp] = useState<File | null>(null);
	const { field } = useController({ control, name: "cover" });

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
					"relative aspect-[16/3.5] w-full rounded-md",
					!hasImage && "border border-dashed border-input",
				)}
			>
				{hasImage && (
					<Image
						src={temp ? URL.createObjectURL(temp) : field.value!}
						fill
						alt="Cover"
						objectFit="cover"
						objectPosition="top"
						unoptimized={!!temp}
						className="rounded-md"
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
						<CoverFieldUploadButton temp={temp} onUploadComplete={onUploadComplete} />
					</div>
				)}

				{!hasImage && (
					<label className="absolute inset-0 flex flex-col items-center justify-center">
						<UploadRoundedIcon className="size-8 text-primary" />
						<span className="text-secondary-foreground">
							Drag & drop or click here to upload a cover
						</span>
						<input type="file" accept="image/*" hidden onChange={onFileSelect} />
					</label>
				)}
			</div>

			<ErrorField control={control} name="cover" />
		</div>
	);
}

type CoverFieldUploadButtonProps = {
	temp: File | null;
	onUploadComplete: (url: string) => void;
};

function CoverFieldUploadButton({ temp, onUploadComplete }: CoverFieldUploadButtonProps) {
	const [isPending, startTransition] = useTransition();

	const onUpload: MouseEventHandler<HTMLButtonElement> = async (e) => {
		e.preventDefault();
		if (!temp) return;

		startTransition(async () => {
			const blob = await upload(`covers/${temp.name}`, temp, {
				access: "public",
				handleUploadUrl: "/api/uploads",
			});

			startTransition(() => onUploadComplete.call(undefined, blob.url));
		});
	};

	return (
		<Button
			type="button"
			intent="primary"
			className={clsx(
				"gap-2 transition-[width] duration-emphasized ease-emphasized-decelerate",
				isPending ? "w-9" : "w-26",
			)}
			onClick={onUpload}
		>
			{isPending ? (
				<LoaderIcon className="size-5 animate-spin" />
			) : (
				<>
					<UploadRoundedIcon className="size-5" />
					Upload
				</>
			)}
		</Button>
	);
}
