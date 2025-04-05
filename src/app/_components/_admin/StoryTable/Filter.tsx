import { StoryStatus } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";

import { asReadableStoryStatus } from "~/utils/grammar";

import Select from "~/app/_components/form/Select";
import SelectItem from "~/app/_components/form/Select/Item";
import { InputSkeleton } from "~/app/_components/form/Input";

type Props = { status: [StoryStatus | "all", Dispatch<SetStateAction<StoryStatus | "all">>] };
export default function StoryTableFilter({ status: [status, setStatus] }: Props) {
	return (
		<div className="mb-2 grid grid-cols-[--spacing(48)_1fr]">
			<Select
				label="Status"
				placeholder="Select a status"
				defaultValue={status}
				onValueChange={(x) => setStatus(x as StoryStatus)}
			>
				<SelectItem value="all" label="All" />
				{Object.entries(StoryStatus).map(([key, value]) => (
					<SelectItem key={key} value={key} label={asReadableStoryStatus(value)} />
				))}
			</Select>
		</div>
	);
}

export function StoryTableFilterSkeleton() {
	return (
		<div className="mb-2 grid grid-cols-[--spacing(48)_1fr]">
			<InputSkeleton id="status" label="Status" />
		</div>
	);
}
