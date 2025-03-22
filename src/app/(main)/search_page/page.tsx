import SearchInput from './SearchInput'; // Import the Client Component

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const searchTerm = searchParams.q || ''; // Get search term from query params

    return (
        <div>
            <header>
                <h1>TrueLens</h1>
                <SearchInput /> {/* Include the SearchInput Client Component */}
            </header>

            <main>
                <div>
                    <h2>Search Results for {searchTerm}</h2>
                    {/* Replace with your actual search results display */}
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        {/* ... your image and result content ... */}
                    </div>
                    <button>Show me more results</button>
                </div>
            </main>

        </div>
    );
}