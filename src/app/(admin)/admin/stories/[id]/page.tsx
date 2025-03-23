"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { type Control, useFieldArray, useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";

import { api, RouterOutputs } from "~/trpc/react";

import Button from "~/app/_components/form/Button";
import HookedInput from "~/app/_components/form/hooked/Input";
import { DeleteRoundedIcon } from "~/app/_components/icons/material/DeleteRounded";
import { AddRoundedIcon } from "~/app/_components/icons/material/AddRounded";
import { useRouter } from "next/navigation";

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
	const [data, storyQuery] = api.story.getById.useSuspenseQuery({ id });

	return (
		<main className="pt-4 pl-6">
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

	const onSubmit = handleSubmit(async (data) => {
		console.log(data);
	});

	return (
		<form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-3">
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
