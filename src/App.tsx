import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DemosExample from './DemosExample';
import Admin from './pages/Admin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DemosExample />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
