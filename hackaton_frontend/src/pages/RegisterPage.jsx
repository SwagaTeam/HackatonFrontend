import { useState } from "react";
import "./AuthPages.css";
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    const response = await fetch("http://localhost:5246/User/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: email,
        password,
        repeatPassword: confirmPassword,
      }),
    });

    if (response.ok) {
      navigate("/login");
    } else {
      const error = await response.json();
      alert("Ошибка: " + JSON.stringify(error.errors));
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <div class="nav-buttons">
        <a href="/login">Войти</a>
      </div>
      <img
        src="/panda_1.png"
        alt="Красная панда"
        className="panda-mascot"
      />
    </div>
  );
}
