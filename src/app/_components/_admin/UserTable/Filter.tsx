import { UserRole } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";

import { asReadableUserRole } from "~/utils/grammar";

import Select from "~/app/_components/form/Select";
import SelectItem from "~/app/_components/form/Select/Item";
import { InputSkeleton } from "~/app/_components/form/Input";

type Props = { role: [UserRole | "all", Dispatch<SetStateAction<UserRole | "all">>] };
export default function UserTableFilter({ role: [role, setRole] }: Props) {
	return (
		<div className="mb-2 grid grid-cols-[--spacing(48)_1fr]">
			<Select
				label="Role"
				placeholder="Select a role"
				defaultValue={role}
				onValueChange={(x) => setRole(x as UserRole)}
			>
				<SelectItem value="all" label="All" />
				{Object.entries(UserRole).map(([key, value]) => (
					<SelectItem key={key} value={key} label={asReadableUserRole(value)} />
				))}
			</Select>
		</div>
	);
}

export function UserTableFilterSkeleton() {
	return (
		<div className="mb-2 grid grid-cols-[--spacing(48)_1fr]">
			<InputSkeleton id="role" label="Role" />
		</div>
	);
}
