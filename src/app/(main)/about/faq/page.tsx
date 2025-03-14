import { EMAIL } from "~/constants";

import { AccordionRoot, AccordionItem, AccordionItemContent } from "~/app/_components/Accordion";

type FaqData = { question: string; answer: string | string[] };
const FAQS: FaqData[] = [
	{
		question: "What is TrueLens?",
		answer: "TrueLens is a platform that aggregates news articles from various sources to analyze and provide insights on factuality and credibility of an article, outlet and journalists. Without ever relying on third-party sources.",
	},
	{
		question: "How does TrueLens work?",
		answer: "We aggregate articles from verified sources, and cluster them based on a common topic. Then, we large language models to analyze the content and provide insights on the factuality and credibility of the article, outlet and journalist.",
	},
	{
		question: "How do I contribute?",
		answer: [
			"As an open-source project, we welcome contributions from the community. You can contribute by reporting bugs, suggesting features, or even submitting pull requests to improve the platform.",
			"Moreover, proceedings from our premium plans are used to fund the development and maintenance of the platform.",
		],
	},
	{
		question: "I bought a premium plan, but I want to refund it. How can I do that?",
		answer: "After a premium plan is purchased, it cannot be refunded as per our policy. However, you can cancel the subscription at any time, and it will not be renewed.",
	},
];

export default function Page() {
	return (
		<div className="mx-auto max-w-2xl py-8">
			<div className="mb-6 flex flex-col gap-y-1">
				<h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
				<span className="text-sm text-muted-foreground">
					Here are some common questions about our products and services. If you have any
					other questions, feel free to contact us at{" "}
					<a href={`mailto:${EMAIL}`} className="underline">
						{EMAIL}
					</a>
					.
				</span>
			</div>

			<AccordionRoot>
				{FAQS.map((faq, i) => (
					<AccordionItem key={i} title={faq.question} value={i.toString()}>
						<AccordionItemContent value={i.toString()}>
							{typeof faq.answer === "string"
								? faq.answer
								: faq.answer.map((x, i) => <p key={i}>{x}</p>)}
						</AccordionItemContent>
					</AccordionItem>
				))}
			</AccordionRoot>
		</div>
	);
}
