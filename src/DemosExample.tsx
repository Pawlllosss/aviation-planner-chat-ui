import { useEffect, useState } from 'react';
import api from './utils/api';

function DemosExample() {
    const [demos, setDemos] = useState<string[]>([]);

    useEffect(() => {
        api.get<string[]>('/demos')
            .then(data => {
                console.log('API response:', data);
                setDemos(data);
            })
            .catch(err => console.error('Fetch error:', err));
    }, []);

    const handlePostPrompt = async () => {
        try {
            const response = await api.post('/prompts', {
                prompt: 'string',
                response: 'string'
            });
            console.log('POST response:', response);
        } catch (err) {
            console.error('POST error:', err);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Demos</h2>

            <button
                onClick={handlePostPrompt}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Test POST /prompts
            </button>

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
