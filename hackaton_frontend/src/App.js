import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Главная</Link> |{" "}
        <Link to="/register">Регистрация</Link> |{" "}
        <Link to="/login">Вход</Link>
      </nav>
       <img
        src="/panda_1.png"
        alt="Красная панда"
        className="panda-mascot"
      />
      <Routes>
        <Route path="/" element={<MainPage />} />     
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
    
  );
}