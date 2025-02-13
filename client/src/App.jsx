import { Routes, Route } from "react-router-dom";
import "./styles/App.css";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;
