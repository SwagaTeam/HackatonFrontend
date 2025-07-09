import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import "./pages/AuthPages.css";
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage/>}/>
      </Routes>
    </Router>
    
  );
}

export default App;
