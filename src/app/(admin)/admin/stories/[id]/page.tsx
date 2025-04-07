"use client";

import { z } from "zod";
import { use } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StoryStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Control, useFieldArray, useForm, type UseFormRegister } from "react-hook-form";

import { api, RouterOutputs } from "~/trpc/react";
import { asReadableStoryStatus } from "~/utils/grammar";

import Button from "~/app/_components/form/Button";
import HookedInput from "~/app/_components/form/hooked/Input";
import HookedSelect from "~/app/_components/form/hooked/Select";
import SelectItem from "~/app/_components/form/Select/Item";
import AdminHookedCoverField from "~/app/_components/_admin/form/CoverField";
import AdminArticleCard from "~/app/_components/_admin/ArticleCard";

import DeleteRoundedIcon from "~/app/_components/icons/material/DeleteRounded";
import AddRoundedIcon from "~/app/_components/icons/material/AddRounded";

type Props = {
	params: Promise<{ id: string }>;
};

const validation = z.object({
	title: z.optional(z.string().min(1, "Title is required")),
	summary: z.optional(
		z
			.array(z.object({ value: z.string().min(1, "Summary is required") }))
			.min(1, "At least one summary is required"),
	),
	cover: z.optional(z.string()),
	status: z.nativeEnum(StoryStatus).optional(),
});

type ValidationType = z.infer<typeof validation>;

export default function Page({ params }: Props) {
	const { id } = use(params);
	const [data] = api.story.getById.useSuspenseQuery({ id });

	return (
		<main className="space-y-2 py-4 pl-6">
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

	const deleteStory = api.story.delete.useMutation({
		onSuccess: () => {
			utils.story.getAll.invalidate();
			utils.story.getById.invalidate({ id: data.id });

			toast.success("Story deleted successfully");
			router.push("/admin/stories");
		},
	});

	const updateStory = api.story.update.useMutation({
		onSuccess: (input) => {
			utils.story.getAll.invalidate();
			utils.story.getById.invalidate({ id: input.id });
		},
	});

	const {
		control,
		handleSubmit,
		register,
		formState: { isDirty, isSubmitting },
	} = useForm({
		resolver: zodResolver(validation),
		defaultValues: {
			title: data.title,
			summary: data.summary.map((value) => ({ value })),
			cover: data.cover ?? undefined,
			status: data.status,
		},
	});

	const onSubmit = handleSubmit(async (result) => {
		await updateStory.mutateAsync({
			id: data.id,
			title: result.title,
			summary: result.summary?.map((s) => s.value) ?? data.summary,
			cover: result.cover,
			status: result.status,
		});

		toast.success("Story updated successfully");
		router.push("/admin/stories");
	});

	return (
		<form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
			<AdminHookedCoverField control={control} name="cover" />
			<HookedInput
				control={control}
				id="title"
				label="Title"
				defaultValue={data.title}
				{...register("title")}
			/>
			<SummaryFieldSet control={control} register={register} />
			<div className="w-48 self-end">
				<HookedSelect
					control={control}
					name="status"
					label="Status"
					placeholder="Select a status"
					defaultValue={data.status}
				>
					{Object.entries(StoryStatus).map(([key, value]) => (
						<SelectItem key={key} value={key} label={asReadableStoryStatus(value)} />
					))}
				</HookedSelect>
			</div>

			<div>
				<h2 className="inline-flex text-xl font-medium">
					Publications
					<span className="mt-1 ml-0.5 text-xs text-muted-foreground">
						({data.articles.length})
					</span>
				</h2>
				<div className="mt-2 grid max-w-4xl grid-cols-1 gap-2">
					{data.articles.map((article) => (
						<AdminArticleCard
							key={article.id}
							id={article.id}
							title={article.title}
							summary={article.content}
							url={article.externalUrl}
							publishedAt={article.publishedAt}
							publisherLogo={article.outlet.logoUrl}
							publisherName={article.outlet.name}
							factuality={article.factuality}
						/>
					))}
				</div>
			</div>

			<div className="mt-12 inline-flex items-center gap-2">
				<Button
					type="button"
					intent="destructiveBorder"
					className="w-36 gap-2"
					onClick={() => deleteStory.mutate(data)}
				>
					<DeleteRoundedIcon className="size-5" />
					Delete Article
				</Button>
				<div className="flex-1" />
				<Button type="button" intent="ghost" className="w-24" onClick={() => router.back()}>
					Back
				</Button>
				<Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>
					{isSubmitting ? "Updating..." : "Update"}
				</Button>
			</div>
		</form>
	);
}

type SummaryFieldSetProps = {
	control: Control<ValidationType>;
	register: UseFormRegister<ValidationType>;
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
