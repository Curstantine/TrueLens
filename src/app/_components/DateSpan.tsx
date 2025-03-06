"use client";

type Props = { value: Date; className?: string };

const formatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
	localeMatcher: "best fit",
	numeric: "auto",
	style: "long",
});

export function DateSpan({ value, className }: Props) {
	return <span className={className}>{formatter.format(value)}</span>;
}

export function RelativeDateSpan({ value, className }: Props) {
	const now = new Date();
	const diff = value.getTime() - now.getTime();

	return (
		<span className={className} title={formatter.format(value)}>
			{relativeFormatter.format(Math.round(diff / (1000 * 60 * 60)), "day")}
		</span>
	);
}
