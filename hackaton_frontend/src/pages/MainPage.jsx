import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const COLORS = [
  '#FADBD8', '#D1F2EB', '#D6EAF8', '#F9E79F',
  '#E8DAEF', '#F5CBA7', '#AED6F1', '#D5F5E3'
];

function getShuffledColors(count) {
  const shuffled = [...COLORS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const MainPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5246/Module/get-all')
      .then((response) => {
        if (!response.ok) throw new Error('Ошибка при получении данных');
        return response.json();
      })
      .then((data) => {
        setModules(data);
        setColors(getShuffledColors(data.length));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        setLoading(false);
      });
  }, []);

  const handleOpenClick = (moduleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Здесь можешь сделать переход на страницу модуля
    // Например:
    navigate(`/module/${moduleId}`);
    
    // Или если пока нет маршрута:
    // alert(`Открываем модуль с id: ${moduleId}`);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="main-container">
      <header className="header">
        <h1>Список модулей</h1>
      </header>
      <div className="module-grid">
        {modules.map((module, index) => (
          <div
            key={module.title}
            className="module-card"
            style={{ backgroundColor: colors[index] || '#eee' }}
          >
            <div className="module-title">{module.title}</div>
            <div className="module-levels">Уровней: {module.levels.length}</div>
            <button
              className="module-button"
              onClick={() => handleOpenClick(module.id)}
            >
              Открыть
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
