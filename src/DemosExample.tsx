import { useEffect, useState } from 'react';


function DemosExample() {
    const [demos, setDemos] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/demos')
            .then(res => res.json())
            .then(data => {
                console.log('API response:', data);
                setDemos(data);
            })
            .catch(err => console.error('Fetch error:', err));
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Demos</h2>

            <ul className="space-y-2">
                {demos.map((demo) => (
                    <li key={demo} className="p-2 border rounded">
                        {demo}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DemosExample;
