"use client";

import { z } from "zod";
import { use } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { api, RouterOutputs } from "~/trpc/react";

import Button from "~/app/_components/form/Button";
import HookedInput from "~/app/_components/form/hooked/Input";
import AdminHookedLogoField from "~/app/_components/_admin/form/LogoField";

import DeleteRoundedIcon from "~/app/_components/icons/material/DeleteRounded";

type Props = {
	params: Promise<{ id: string }>;
};

const validation = z.object({
	name: z.optional(z.string().min(1, "Name is required")),
	url: z.optional(z.string().url()),
	logoUrl: z.optional(z.string().url()),
});

export default function Page({ params }: Props) {
	const { id } = use(params);
	const [data] = api.newsOutlet.getById.useSuspenseQuery({ id });

	return (
		<main className="space-y-2 py-4 pl-6">
			<h1 className="text-2xl font-semibold">
				Edit Outlet #<span className="text-lg text-muted-foreground">{data.id}</span>
			</h1>
			<Form data={data} />
		</main>
	);
}

type FormProps = { data: RouterOutputs["newsOutlet"]["getById"] };
function Form({ data }: FormProps) {
	const router = useRouter();

	const utils = api.useUtils();

	const deleteStory = api.newsOutlet.delete.useMutation({
		onSuccess: () => {
			utils.newsOutlet.getAll.invalidate();
			utils.newsOutlet.getById.invalidate({ id: data.id });

			toast.success("Outlet deleted successfully");
			router.push("/admin/outlets");
		},
	});

	const updateStory = api.newsOutlet.update.useMutation({
		onSuccess: (input) => {
			utils.newsOutlet.getAll.invalidate();
			utils.newsOutlet.getById.invalidate({ id: input.id });
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
			name: data.name,
			url: data.url,
			logoUrl: data.logoUrl ?? undefined,
		},
	});

	const onSubmit = handleSubmit(async (result) => {
		await updateStory.mutateAsync({
			id: data.id,
			name: result.name,
			logoUrl: result.logoUrl,
			url: result.url,
		});

		toast.success("Outlet updated successfully");
		router.push("/admin/outlets");
	});

	return (
		<form onSubmit={onSubmit} noValidate className="grid grid-cols-[--spacing(64)_1fr] gap-3">
			<AdminHookedLogoField control={control} name="logoUrl" />
			<div className="flex flex-col gap-3">
				<HookedInput
					control={control}
					id="title"
					label="Title"
					defaultValue={data.name}
					{...register("name")}
				/>

				<HookedInput
					control={control}
					id="url"
					label="Site URL"
					defaultValue={data.url}
					{...register("url")}
				/>
			</div>

			<div className="col-span-full mt-12 inline-flex items-center gap-2">
				<Button
					type="button"
					intent="destructiveBorder"
					className="w-36 gap-2"
					onClick={() => deleteStory.mutate(data)}
				>
					<DeleteRoundedIcon className="size-5" />
					Delete Outlet
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
