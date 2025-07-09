import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import "./pages/AuthPages.css";
import "./App.css"

function App() {
  return (
    <Router>
      <nav>
        <div className="nav-links">
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Регистрация
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Вход
          </NavLink>
        </div>
      </nav>
       <img
        src="/panda_1.png"
        alt="Красная панда"
        className="panda-mascot"
      />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
    
  );
}

export default App;
