import type { Metadata } from "next";
import { getCountryDataList } from "countries-list";

import Button from "~/app/_components/form/Button";
import Input from "~/app/_components/form/Input";
import Select from "~/app/_components/form/Select";
import SelectItem from "~/app/_components/form/Select/Item";

export const metadata: Metadata = {
	title: "TrueLens - Complete your account",
};

const sortedCountries = getCountryDataList().sort((a, b) => a.name.localeCompare(b.name));

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Complete your account</h1>
				<span className="text-sm text-muted-foreground">
					Register an account on TrueLens to get started!
				</span>
			</div>

			<form className="flex flex-col gap-3">
				<Input id="email" type="email" label="Email" name="email" disabled />

				<div className="grid grid-cols-2 gap-2">
					<Input id="first_name" type="text" label="First Name" name="first_name" />
					<Input id="last_name" type="text" label="Last Name" name="last_name" />
				</div>

				<Select label="Country" placeholder="Select a country">
					{sortedCountries.map(({ name, iso2 }) => (
						<SelectItem key={iso2} value={iso2} label={name} />
					))}
				</Select>

				<Button type="submit" className="mt-4">
					Continue
				</Button>
			</form>
		</main>
	);
}
