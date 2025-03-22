'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchInput() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('q', searchTerm);
        } else {
            params.delete('q');
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
}