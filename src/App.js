import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeContextProvider } from "./ThemeContext";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import HomePage from "./Components/HomePage/HomePage";
import UploadPage from "./Components/UploadPage/Upload";
import SimulationPage from "./Components/SimulationPage/Simulation";
import ResultsPage from "./Components/ResultsPage/Results";
import SettingsPage from "./Components/SettingsPage/Settings";
import HelpPage from "./Components/HelpPage/Help";
import AboutPage from "./Components/AboutPage/About";

function App() {
    return (
        <ThemeContextProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginSignup />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/simulation" element={<SimulationPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/about" element={<AboutPage />} />
                </Routes>
            </Router>
        </ThemeContextProvider>
    );
}

export default App;