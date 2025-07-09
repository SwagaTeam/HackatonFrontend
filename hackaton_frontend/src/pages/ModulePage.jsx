import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ModulePage.css';  // добавим стили отдельно

const ModulePage = () => {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5246/Module/get-by/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Ошибка при получении модуля');
        return response.json();
      })
      .then(data => {
        setModule(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загрузка модуля...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!module) return <div>Модуль не найден</div>;

  return (
    <div className="module-page">
      <h2>Модуль: {module.title}</h2>
      <div className="levels-container">
        {module.levels.map((level, index) => (
          <div className="level-wrapper" key={level.id}>
            <div className="level-circle">
              <div className="level-number">{level.levelNumber}</div>
              <div className="level-name">{level.name}</div>
              <div className="level-difficulty">Сложность: {level.difficulty}</div>
            </div>
            {/* Если не последний уровень, рисуем соединительную линию */}
            {index < module.levels.length - 1 && (
              <div className="level-connector" />
            )}
          </div>
        ))}
      </div>
      <button onClick={() => navigate(-1)}>Назад</button>
    </div>
  );
};

export default ModulePage;
