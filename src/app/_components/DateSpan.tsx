"use client";

type Props = { value: Date; className?: string };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

const relFormatter = new Intl.RelativeTimeFormat("en", {
	localeMatcher: "best fit",
	numeric: "auto",
	style: "long",
});

export function DateSpan({ value, className }: Props) {
	return <span className={className}>{dateFormatter.format(value)}</span>;
}

export function DateTimeSpan({ value, className }: Props) {
	return <span className={className}>{dateTimeFormatter.format(value)}</span>;
}

export function RelativeDateSpan({ value, className }: Props) {
	const now = new Date();
	const diff = value.getTime() - now.getTime();

	return (
		<span className={className} title={dateFormatter.format(value)}>
			{relFormatter.format(Math.round(diff / (1000 * 60 * 60)), "day")}
		</span>
	);
}
