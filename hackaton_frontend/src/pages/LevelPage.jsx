import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LevelPage.css';
import { UserContext } from '../context/UserContext';

const LevelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, loading: loadingUser } = useContext(UserContext);

  const [level, setLevel] = useState(null);
  const [questionIds, setQuestionIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [shortDescription, setShortDescription] = useState(null);
  const [shortDescLoading, setShortDescLoading] = useState(false);
  const [shortDescError, setShortDescError] = useState(null);

  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(null);

  const seatImg = require('../seat.png');
  const jumpImg = require('../jump.png');
  const [mascotSrc, setMascotSrc] = useState(seatImg);

  // Новый стейт для количества неправильных попыток и блокировки
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Хуки вызываются всегда, на верхнем уровне:
  useEffect(() => {
    setLoading(true);
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
        setCurrentIndex(0);
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
      setSelectedAnswerId(null);
      setCheckResult(null);
      setCheckError(null);
      setMascotSrc(seatImg);

      // Сбрасываем счетчик неправильных попыток и блокировку при смене вопроса
      setWrongAttempts(0);
      setIsBlocked(false);

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

  if (loadingUser) return <div className="level-page-wrapper">Загрузка данных пользователя...</div>;

  if (loading) return <div className="level-page-wrapper">Загрузка уровня...</div>;
  if (error) return <div className="level-page-wrapper">Ошибка: {error}</div>;
  if (!level) return <div className="level-page-wrapper">Уровень не найден</div>;

  const fetchShortDescription = () => {
    if (!level?.theory?.text) return;

    setShortDescLoading(true);
    setShortDescError(null);
    setShortDescription(null);

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

  const fetchAiAnswer = () => {
    if (!level?.theory?.text || chatInput.trim() === '') return;

    setChatLoading(true);
    setChatError(null);
    setChatResponse(null);

    const payload = {
      question: chatInput,
      text: level.theory.text,
    };

    fetch('http://localhost:5246/Ai/GetAnswerQuestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при получении ответа от AI');
        return res.text();
      })
      .then(data => {
        setChatResponse(data);
        setChatLoading(false);
      })
      .catch(err => {
        setChatError(err.message);
        setChatLoading(false);
      });
  };

  const handleCheck = () => {
    if (isBlocked) return;
    if (selectedAnswerId === null) {
      alert('Пожалуйста, выберите ответ перед проверкой.');
      return;
    }

    setChecking(true);
    setCheckError(null);
    setCheckResult(null);

    const userAnswerRequest = {
      UserId: user?.id || 1,
      QuestionId: currentQuestion.id,
      SelectedAnswers: [selectedAnswerId],
    };

    fetch('http://localhost:5246/UserAnswer/get-correct-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAnswerRequest),
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при проверке ответа');
        return res.json();
      })
      .then(data => {
        setCheckResult(data);
        setChecking(false);
        if (data.isAllAnswersCorrect) {
          setMascotSrc(jumpImg);
        } else {
          setWrongAttempts(prev => {
            const newCount = prev + 1;
            if (newCount >= 2) setIsBlocked(true);
            return newCount;
          });
          setMascotSrc(seatImg);
          setIsBlocked(true);
        }
      })
      .catch(err => {
        setCheckError(err.message);
        setChecking(false);
      });
  };

  const handleNext = () => {
    if (currentIndex < questionIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCheckResult(null);
      setSelectedAnswerId(null);
      setCheckError(null);
      setMascotSrc(seatImg);
      setIsBlocked(false);
    } else {
      const rightAnswers = questionIds.filter((_, idx) => {
        return idx < currentIndex || (checkResult && checkResult.isAllAnswersCorrect);
      }).length;

      const questionsCount = questionIds.length;
      const token = localStorage.getItem('token');
      fetch(`http://localhost:5246/Level/is-level-completed?rightAnswers=${rightAnswers}&questionsCount=${questionsCount}&levelNumber=${level.levelNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            navigate(-1);
          } else {
            return res.text().then(text => {
              throw new Error(text || 'Ошибка при проверке завершения уровня');
            });
          }
        })
        .catch(err => {
          alert('Ошибка при проверке завершения уровня: ' + err.message);
        });
    }
  };


  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>×</button>

        {level.theory ? (
          <>
            <h2 className="sidebar-title">{level.theory.title}</h2>

            <div className="sidebar-content-wrapper">
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
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {chatResponse && (
                  <div className="chat-message ai">
                    <strong>Ответ:</strong> {chatResponse}
                  </div>
                )}
              </div>
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Введите вопрос..."
                />
                <button className="chat-send-btn" onClick={fetchAiAnswer} disabled={chatLoading}>
                  {chatLoading ? '...' : '→'}
                </button>
              </div>
              {chatError && <p className="error-text">Ошибка: {chatError}</p>}
            </div>
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

              <div className="answers-block-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="answers-block" style={{ width: '100%' }}>
                  {currentQuestion.answers?.map((answer, index) => (
                    <div key={index}>
                      <input
                        type="radio"
                        id={`answer-${index}`}
                        name="answer"
                        checked={selectedAnswerId === answer.id}
                        onChange={() => setSelectedAnswerId(answer.id)}
                        disabled={isBlocked}
                        disabled={isBlocked}
                      />
                      <label htmlFor={`answer-${index}`}>{answer.text}</label>
                    </div>
                  ))}
                </div>

                <button
                  className="check-button"
                  onClick={handleCheck}
                  disabled={checking || isBlocked}
                  title={isBlocked ? 'Достигнут лимит попыток. Обновите страницу.' : 'Проверить ответ'}
                >
                  {checking ? 'Проверка...' : 'Проверить'}
                </button>
              </div>

              {checkError && <p className="error-text">Ошибка: {checkError}</p>}

              {checkResult && (
                <div
                  className={`check-result ${checkResult.isAllAnswersCorrect ? 'correct' : 'incorrect'}`}
                >
                  {checkResult.isAllAnswersCorrect
                    ? 'Ответ правильный! 🎉'
                    : 'Ответ неверный. Попробуйте ещё раз.'}
                </div>
              )}

              {isBlocked && (
                <p className="error-text">
                  Вы достигли максимального количества попыток. Обновите страницу для повторной попытки.
                </p>
              )}
            </>
          ) : (
            <p>Вопрос не найден</p>
          )}

          <div className="buttons-wrapper" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="back-button-wrapper">
              <button
                className="back-button"
                onClick={() => {
                  navigate(-1);
                  setMascotSrc(seatImg);
                }}
              >
                Назад
              </button>
            </div>
            <div className="back-button-wrapper">
              <button onClick={handleNext} className="back-button">
                Далее
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            width: '10%',
            minWidth: '80px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: '20px',
          }}
        >
          <img
            src={mascotSrc}
            alt="Mascot"
            style={{ width: '100%', height: 'auto', userSelect: 'none' }}
            draggable={false}
          />
          <div className="mascot-wrapper">
            <img src={mascotSrc} alt="Mascot" draggable={false} />
          </div>
        </div>
      </>
      );
};

      export default LevelPage;
