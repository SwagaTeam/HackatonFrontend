import React, { createContext, useState, useEffect } from 'react';

// Создаём контекст
export const UserContext = createContext(null);

// Провайдер
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const token = localStorage.getItem('token');
    console.log("token", token);
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch("http://localhost:5246/User/get-user", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal,
      // credentials: 'include', // раскомментируйте, если используете куки
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Неавторизован");
        }
        if (!res.ok) {
          throw new Error("Ошибка получения пользователя");
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Ошибка при получении пользователя:", err.message);
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      controller.abort(); // отмена запроса при размонтировании
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
