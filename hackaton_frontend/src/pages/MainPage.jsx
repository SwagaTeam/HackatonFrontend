import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

const COLORS = [
  '#ca133e',
  '#a81830',
  '#7c1521'
];

function getSequentialColors(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(COLORS[i % COLORS.length]);
  }
  return result;
}

const MainPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  const navigate = useNavigate(); // ✅ хук для навигации

  // Получаем модули с сервера
  useEffect(() => {
    fetch('http://localhost:5246/Module/get-all')
      .then((response) => {
        if (!response.ok) throw new Error('Ошибка при получении данных');
        return response.json();
      })
      .then((data) => {
        setModules(data);
        setColors(getSequentialColors(data.length));
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

  // Обработчик изменения размера окна, устанавливаем количество колонок
  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth;

      if (width >= 2560) {         // 2K и выше (примерно 2560px)
        setColumns(5);
      } else if (width >= 1920) {  // FullHD (1920px)
        setColumns(3);
      } else if (width >= 1280) {  // HD примерно
        setColumns(3);
      } else {
        setColumns(2);
      }
    }

    updateColumns();
    window.addEventListener('resize', updateColumns);

    return () => window.removeEventListener('resize', updateColumns);
  }, []);
    
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
      <div 
        className="module-grid" 
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {modules.map((module, index) => (
          <div
            key={module.title}
            className="module-card"
            style={{ backgroundColor: colors[index] }}
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
