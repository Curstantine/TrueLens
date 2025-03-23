import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || ""; // Get query from URL

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get("search") as string;
        router.push(`/search?query=${searchQuery}`);
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-100">
            {/* Header */}
            <header className="flex justify-between p-4 shadow-md bg-white">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        defaultValue={query} // Prefill input with search query
                        placeholder="Search"
                        className="border rounded px-2 py-1"
                    />
                    <button type="submit" className="bg-red-600 text-white px-4 py-1 rounded">
                        Search
                    </button>
                </form>
            </header>

            {/* Search Section */}
            <main className="flex-grow flex justify-center items-center">
                <form onSubmit={handleSearch} className="w-full max-w-lg">
                    <input
                        type="text"
                        name="search"
                        defaultValue={query}
                        placeholder="Lorem Ipsum Dorem"
                        className="border w-full px-3 py-2 rounded-lg shadow-sm"
                    />
                    <button type="submit" className="mt-2 bg-red-600 text-white w-full py-2 rounded-lg">
                        Search
                    </button>
                </form>
            </main>

        </div>
    );
}
