import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DemosExample from './DemosExample';
import Admin from './pages/Admin';
import LandingStack from './pages/LandingStack';
import RetirementForm from "./RetirementForm.tsx";
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingStack />} />
                <Route path="/calculator" element={<RetirementForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/demos" element={<DemosExample />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
