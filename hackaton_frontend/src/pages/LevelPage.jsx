import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LevelPage = () => {
  const { id } = useParams();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5246/Level/get-by/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка при получении уровня');
        return res.json();
      })
      .then(data => {
        setLevel(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загрузка уровня...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!level) return <div>Уровень не найден</div>;

  // Показываем первый вопрос из списка
  const firstQuestion = level.questions && level.questions.length > 0 ? level.questions[0] : null;

  return (
    <div>
      <h2>Уровень {level.levelNumber}: {level.name}</h2>
      <p>Сложность: {level.difficulty}</p>
      {firstQuestion ? (
        <div>
          <h3>Первый вопрос:</h3>
          <p>{firstQuestion.text /* предполагается, что есть поле text */}</p>
          {/* Здесь можно добавить UI для ответа на вопрос */}
        </div>
      ) : (
        <p>Вопросы отсутствуют</p>
      )}
      <button onClick={() => navigate(-1)}>Назад</button>
    </div>
  );
};

export default LevelPage;
