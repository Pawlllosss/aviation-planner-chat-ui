import {useEffect} from 'react'
import './App.css'
import {createChat} from "@n8n/chat";
import DemosExample from './DemosExample';

function App() {
    console.log(import.meta.env.VITE_N8N_WEBHOOK_URL);
    useEffect(() => {
        createChat({
            webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
            mode: 'fullscreen',
            initialMessages: [],
            i18n: {
                en: {
                    title: 'Aviation planner chat 🛫',
                    subtitle: "Type in your departure aiport, destination and points on route. We will provide you the pre-flight briefing!",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: "Let's take off!",
                    closeButtonTooltip: "",
                },
            },
        });
    }, []);

    return (<div>
        <DemosExample />
        <div id='n8n-chat'>

        </div>

    </div>);
}

export default App
