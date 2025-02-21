"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { ICountryData } from "countries-list";

import { registerCompleteSchema } from "~/server/validation/auth";
import { registerCompleteAction } from "~/server/actions/auth";

import Button from "~/app/_components/form/Button";
import Input from "~/app/_components/form/Input";
import SelectItem from "~/app/_components/form/Select/Item";
import HookedSelect from "~/app/_components/form/hooked/Select";

type Props = { userId: string; email: string; countries: Pick<ICountryData, "name" | "iso2">[] };

export default function SignUpCompleteForm({ userId, email, countries }: Props) {
	const { control, register, handleSubmit } = useForm({
		resolver: zodResolver(registerCompleteSchema),
	});

	const onSubmit = handleSubmit(async (data) => {
		const resp = await registerCompleteAction(data);

		if (resp?.serverError) {
			toast.error("An error occurred. Please try again later.", {
				description: resp.serverError,
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			<input type="hidden" value={userId} readOnly {...register("userId")} />
			<Input id="email" type="email" label="Email" readOnly disabled value={email} />
			<Input id="name" type="text" label="Name" {...register("name")} />

			<HookedSelect
				control={control}
				name="country"
				label="Country"
				placeholder="Select a country"
			>
				{countries.map(({ name, iso2 }) => (
					<SelectItem key={iso2} value={iso2} label={name} />
				))}
			</HookedSelect>

			<Button type="submit" className="mt-4">
				Continue
			</Button>
		</form>
	);
}
