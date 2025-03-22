"use client"; // Required for Next.js App Router

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (query.trim() !== "") {
            router.push(`/search?query=${query}`);
        }
    }, [query, router]);
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-100">
            <main className="flex-grow flex justify-center items-center">
                <input
                    type="text"
                    placeholder="Lorem Ipsum Dorem"
                    className="border w-full max-w-lg px-3 py-2 rounded-lg shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </main>
        </div>

    );
}