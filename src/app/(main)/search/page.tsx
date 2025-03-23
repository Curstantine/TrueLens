"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const [results, setResults] = useState<string[]>([]); // Mock data, replace with API call

    // Simulate a search operation
    useEffect(() => {
        if (query) {
            const mockData = ["Apple", "Banana", "Cherry"];
            const filteredResults = mockData.filter((item) =>
                item.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filteredResults);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
            <div className="text-center w-full max-w-lg bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold">Search Results</h1>
                <p className="text-gray-600">Results for: {query}</p>

                {/* Results */}
                <div className="mt-6">
                    {results.length > 0 ? (
                        <ul className="border rounded-md p-4 bg-gray-50 shadow">
                            {results.map((item, index) => (
                                <li key={index} className="p-2 border-b last:border-none text-lg">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-lg mt-4">No matches found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
