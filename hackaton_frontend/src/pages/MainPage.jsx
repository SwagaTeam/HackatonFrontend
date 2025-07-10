import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionModal from './QuestionModal';
import { UserContext } from '../context/UserContext';
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
  const [columns, setColumns] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [questionError, setQuestionError] = useState(null);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth;

      if (width >= 2560) {
        setColumns(5);
      } else if (width >= 1920) {
        setColumns(3);
      } else if (width >= 1280) {
        setColumns(3);
      } else {
        setColumns(2);
      }
    }

    updateColumns();
    window.addEventListener('resize', updateColumns);

    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const handleOpenClick = (moduleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    navigate(`/module/${moduleId}`);
  };

  const openQuestionModal = () => {
    if (!user || user.currentLevelNumber == null) {
      setQuestionError('Не удалось определить текущий уровень пользователя');
      return;
    }

    setModalOpen(true);
    setQuestionError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
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

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button
          className="module-button modal-open-button"
          onClick={openQuestionModal}
          disabled={modules.length === 0}
        >
          Пройти квиз по вопросам
        </button>
      </div>

      {questionError && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>
          {questionError}
        </div>
      )}

      {modalOpen && user?.currentLevelNumber && (
        <QuestionModal
          levelId={user.currentLevelNumber}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MainPage;
