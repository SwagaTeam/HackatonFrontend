import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import ModulePage from "./pages/ModulePage"; // ✅ правильно
import "./pages/AuthPages.css";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/module/:id" element={<ModulePage />} /> {/* ← добавлено */}
      </Routes>
    </Router>
  );
}

export default App;
