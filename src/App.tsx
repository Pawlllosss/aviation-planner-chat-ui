import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DemosExample from './DemosExample';
import Admin from './pages/Admin';
import LandingStack from './pages/LandingStack';
import RetirementForm from "./RetirementForm.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DemosExample />} />
                <Route path="/calculator" element={<RetirementForm />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/stack" element={<LandingStack />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
