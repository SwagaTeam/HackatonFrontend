import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LevelPage.css';

const LevelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [questionIds, setQuestionIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Новые состояния для краткой информации
  const [shortDescription, setShortDescription] = useState(null);
  const [shortDescLoading, setShortDescLoading] = useState(false);
  const [shortDescError, setShortDescError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5246/Level/get-by/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при получении уровня');
        return res.json();
      })
      .then(data => {
        setLevel(data);
        const ids = data.questions?.map(q => q.id) || [];
        setQuestionIds(ids);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (questionIds.length > 0 && currentIndex < questionIds.length) {
      const questionId = questionIds[currentIndex];
      setQuestionLoading(true);
      fetch(`http://localhost:5246/Question/get-by/${questionId}`)
        .then(res => {
          if (!res.ok) throw new Error('Ошибка при получении вопроса');
          return res.json();
        })
        .then(data => {
          setCurrentQuestion(data);
          setQuestionLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setQuestionLoading(false);
        });
    }
  }, [questionIds, currentIndex]);

  const handleNext = () => {
    if (currentIndex < questionIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('Вы завершили все вопросы!');
      // navigate('/next-page');
    }
  };

  // Функция для получения краткой информации из теории
  const fetchShortDescription = () => {
  if (!level?.theory?.text) return;

  setShortDescLoading(true);
  setShortDescError(null);
  setShortDescription(null);

  // Экранируем переносы строк
  const cleanText = level.theory.text.replace(/\r\n|\r|\n/g, '\\n');

  fetch('http://localhost:5246/Ai/GetShortDescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: cleanText }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка при получении краткого описания');
      return res.text();
    })
    .then(data => {
      setShortDescription(data);
      setShortDescLoading(false);
    })
    .catch(err => {
      setShortDescError(err.message);
      setShortDescLoading(false);
    });
};


  if (loading) return <div className="level-page-wrapper">Загрузка уровня...</div>;
  if (error) return <div className="level-page-wrapper">Ошибка: {error}</div>;
  if (!level) return <div className="level-page-wrapper">Уровень не найден</div>;

  return (
    <>
      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        {level.theory ? (
          <>
            <h2 className="sidebar-title">{level.theory.title}</h2>
            <div className="sidebar-text">{level.theory.text}</div>

            <button
              className="fetch-short-desc-btn"
              onClick={fetchShortDescription}
              disabled={shortDescLoading}
            >
              {shortDescLoading ? 'Загрузка краткой информации...' : 'Получить краткую информацию'}
            </button>

            {shortDescError && <p className="error-text">Ошибка: {shortDescError}</p>}

            {shortDescription && (
              <div className="sidebar-short-description">
                <h3>Краткая информация</h3>
                <p>{shortDescription}</p>
              </div>
            )}
          </>
        ) : (
          <p>Теория отсутствует</p>
        )}
      </aside>

      <div className={`level-page-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="level-page-container">
          <div className="level-header">
            Уровень {level.levelNumber}: {level.name}
            <p>Сложность: {level.difficulty}</p>
          </div>

          {/* Кнопка открытия сайдбара */}
          <button className="show-theory-btn" onClick={() => setSidebarOpen(true)}>
            Показать теорию
          </button>

          {questionLoading ? (
            <p>Загрузка вопроса...</p>
          ) : currentQuestion ? (
            <>
              <div className="question-block">
                <h3>Вопрос {currentIndex + 1}:</h3>
                <p>{currentQuestion.title}</p>
              </div>

              <div className="answers-block">
                {currentQuestion.answers?.map((answer, index) => (
                  <div key={index}>
                    <input type="radio" id={`answer-${index}`} name="answer" />
                    <label htmlFor={`answer-${index}`}>{answer.text}</label>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>Вопрос не найден</p>
          )}

          <div className="buttons-wrapper">
            <div className="back-button-wrapper">
              <button className="back-button" onClick={() => navigate(-1)}>Назад</button>
            </div>
            <div className="back-button-wrapper">
              <button className="back-button" onClick={handleNext}>Далее</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LevelPage;
