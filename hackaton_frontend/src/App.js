import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import ModulePage from "./pages/ModulePage";
import Header from "./components/Header";
import LevelPage from './pages/LevelPage';

import { UserProvider } from "./context/UserContext"; 
import "./pages/AuthPages.css";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/level/:id" element={<LevelPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
