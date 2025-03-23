import clsx from "clsx/lite";

type Props = { factuality: number };

function getLabel(factuality: number) {
	if (factuality >= 0.8) return "Highly Factual";
	if (factuality >= 0.6) return "Factual";
	if (factuality >= 0.4) return "Low Factuality";
	return "Very Low Factuality";
}

function getStyles(factuality: number) {
	if (factuality > 0.6) return "bg-green-50 text-green-600";
	if (factuality > 0.4) return "bg-yellow-50 text-yellow-600";
	return "bg-red-50 text-red-600";
}

export default function FactualityLabel({ factuality }: Props) {
	return (
		<div
			title={`Factuality: ${factuality}`}
			className={clsx("rounded-md border px-2 py-1 text-xs", getStyles(factuality))}
		>
			{getLabel(factuality)}
		</div>
	);
}
