// src/pages/RegisterPage.jsx
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      login: email,            // <- отправляем в поле Login
      password: password,
      repeatPassword: confirmPassword,
    }),
  });

  if (response.ok) {
    alert("Регистрация успешна!");
  } else {
    const error = await response.json();
    alert("Ошибка: " + JSON.stringify(error.errors));
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
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
  );
}
