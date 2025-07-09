import React, { createContext, useState, useEffect } from 'react';

// Создаём контекст
export const UserContext = createContext(null);

// Провайдер с загрузкой пользователя
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // Если токена нет, просто завершаем загрузку, пользователя нет
      setLoading(false);
      setUser(null);
      return;
    }

    fetch("http://localhost:5246/User/get-user", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Не удалось получить пользователя");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
