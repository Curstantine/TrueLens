import type { Metadata } from "next";
import { api } from "~/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const story = await api.story.getById({ id });

	return {
		title: `${story.title} - Admin - TrueLens`,
	};
}

export default function Page({}: Props) {
	return <main className=""></main>;
}
