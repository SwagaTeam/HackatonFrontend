import React, { useEffect, useState } from 'react';
import './QuestionModal.css';

const QuestionModal = ({ levelId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
    console.log("levelid!!!!", levelId);
    
  useEffect(() => {
    // Получаем случайные вопросы ниже уровня (без повышения levelNumber)
    fetch(`http://localhost:5246/Question/get-cards/${levelId}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при получении вопросов');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        setCurrentIndex(0);
        setSelectedAnswerId(null);
        setCheckResult(null);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [levelId]);

  if (error) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <p className="error-text">Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <p>Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleCheck = () => {
    if (selectedAnswerId === null) {
      alert('Выберите ответ!');
      return;
    }
    setChecking(true);
    // Для проверки ответа используем твой API проверки
    fetch('http://localhost:5246/UserAnswer/get-correct-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserId: 1, // заменить на текущего пользователя
        QuestionId: currentQuestion.id,
        SelectedAnswers: [selectedAnswerId],
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при проверке ответа');
        return res.json();
      })
      .then(data => {
        setCheckResult(data);
        setChecking(false);
      })
      .catch(err => {
        setError(err.message);
        setChecking(false);
      });
  };

  const handleNext = () => {
    setSelectedAnswerId(null);
    setCheckResult(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Закрываем модалку, если вопросы закончились
    }
  };

  return (
    <div className="modal-backdrop">
  <div className="modal-content question-modal">
    <button className="close-btn" onClick={onClose}>×</button>

    <h3 className="question-title">Вопрос {currentIndex + 1} из {questions.length}</h3>
    <p className="question-text">{currentQuestion.title}</p>

    <div className="answers-list">
      {currentQuestion.answers?.map((answer) => (
        <div key={answer.id} className={`answer-item ${selectedAnswerId === answer.id ? 'selected' : ''} ${checkResult?.isAllAnswersCorrect && selectedAnswerId === answer.id ? 'correct' : ''}`}>
          <input
            type="radio"
            id={`answer-${answer.id}`}
            name="answer"
            checked={selectedAnswerId === answer.id}
            onChange={() => setSelectedAnswerId(answer.id)}
            disabled={!!checkResult?.isAllAnswersCorrect}
            className="answer-radio"
          />
          <label htmlFor={`answer-${answer.id}`} className="answer-label">{answer.text}</label>
        </div>
      ))}
    </div>

    {checkResult && (
      <p className={`result-message ${checkResult.isAllAnswersCorrect ? 'correct' : 'incorrect'}`}>
        {checkResult.isAllAnswersCorrect ? 'Правильно!' : 'Неправильно.'}
      </p>
    )}

    <button
      onClick={handleCheck}
      disabled={checking || !!checkResult?.isAllAnswersCorrect}
      className="btn check-btn"
    >
      {checking ? 'Проверка...' : 'Проверить'}
    </button>

    {checkResult?.isAllAnswersCorrect && (
      <button onClick={handleNext} style={{ marginLeft: 10 }} className="btn next-btn">
        {currentIndex < questions.length - 1 ? 'Следующий вопрос' : 'Закрыть'}
      </button>
    )}
  </div>
</div>

  );
};

export default QuestionModal;
