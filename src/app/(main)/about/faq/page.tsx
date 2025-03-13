"use client";

import { useState } from "react";
import { Accordion, AccordionItem } from "~/components/ui/accordion";

const faqs = [
    {
        question: "What is Truelens?",
        answer: "Truelens is a platform offering high-quality lenses and eyewear tailored to your needs."
    },
    {
        question: "How can I place an order?",
        answer: "You can visit our website, browse products, and add your preferred items to the cart before proceeding to checkout."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept credit/debit cards, PayPal, and other secure payment options."
    },
    {
        question: "How long does delivery take?",
        answer: "Delivery times vary based on location, but most orders arrive within 3-7 business days."
    },
    {
        question: "Can I return or exchange my purchase?",
        answer: "Yes, we have a hassle-free return and exchange policy within 14 days of purchase."
    },
    {
        question: "Do you offer prescription lenses?",
        answer: "Yes, we provide prescription lenses. You can enter your prescription details while ordering."
    },
    {
        question: "Is there a warranty on your products?",
        answer: "Yes, our products come with a manufacturer's warranty. Please check the product details for more information."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive a tracking number via email."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we offer international shipping to select countries. Shipping rates and times vary."
    }
];

export default function page() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={index.toString()}
                        className="border-b p-4 cursor-pointer"
                        onClick={() => toggleAccordion(index)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">{faq.question}</span>
                            <span>{activeIndex === index ? "−" : "+"}</span>
                        </div>
                        {activeIndex === index && (
                            <p className="mt-2 text-gray-600">{faq.answer}</p>
                        )}
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
