import { useEffect, useState } from 'react';

interface Demo {
    id: string;
    name: string;
}

function DemosExample() {
    const [demos, setDemos] = useState<Demo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDemos = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/demos`, {
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setDemos(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch demos');
            } finally {
                setLoading(false);
            }
        };

        fetchDemos();
    }, []);

    if (loading) {
        return <div className="p-4">Loading demos...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Demos</h2>
            <ul className="space-y-2">
                {demos.map((demo) => (
                    <li key={demo.id} className="p-2 border rounded">
                        {demo.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DemosExample;
