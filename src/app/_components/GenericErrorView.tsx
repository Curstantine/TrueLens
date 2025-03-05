type Props = { title: string; message: string };

export default function GenericErrorView({ title, message }: Props) {
	return (
		<section className="flex flex-col items-center justify-center text-center">
			<h2 className="text-2xl font-medium text-destructive">{title}</h2>
			<span className="max-w-lg text-sm">{message}</span>
		</section>
	);
}
