import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ModulePage.css';
import { UserContext } from "../context/UserContext";

const COLORS = ['#ca133e', '#a81830', '#7c1521'];
const INACTIVE_COLOR = '#c6c4c3';

function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MIN_VERTICAL_GAP = 110;
const MIN_DISTANCE = 190;
const MAX_HORIZONTAL_OFFSET = 300;
const BASE_LEFT = 110;

const ModulePage = () => {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loadingModule, setLoadingModule] = useState(true);
  const [error, setError] = useState(null);
  const [coordsList, setCoordsList] = useState([]);
  const navigate = useNavigate();

  const { user, loading: loadingUser } = useContext(UserContext);

  const numericId = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + 1;
  const circleSize = 160;

  useEffect(() => {
    setLoadingModule(true);
    fetch(`http://localhost:5246/Module/get-by/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Ошибка при получении модуля');
        return response.json();
      })
      .then(data => {
        data.levels.sort((a, b) => a.levelNumber - b.levelNumber);
        setModule(data);

        let prevCoord = null;
        const calculatedCoords = data.levels.map((level, index) => {
          const offsetX = (pseudoRandom(numericId * 5000 + index * 91) * 2 - 1) * MAX_HORIZONTAL_OFFSET;

          let posY;
          if (!prevCoord) {
            posY = pseudoRandom(numericId * 1000 + index * 37) * MIN_VERTICAL_GAP * 2;
          } else {
            posY = prevCoord.top + MIN_VERTICAL_GAP;
            const verticalJitter = (pseudoRandom(numericId * 2000 + index * 57) - 0.5) * MIN_VERTICAL_GAP / 2;
            posY += verticalJitter;

            const dx = BASE_LEFT + offsetX - prevCoord.left;
            const dy = posY - prevCoord.top;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MIN_DISTANCE) {
              const neededDy = Math.sqrt(MIN_DISTANCE * MIN_DISTANCE - dx * dx);
              posY = prevCoord.top + neededDy;
            }
          }

          const coord = { top: posY, left: BASE_LEFT + offsetX };
          prevCoord = coord;
          return coord;
        });

        setCoordsList(calculatedCoords);
        setLoadingModule(false);
      })
      .catch(err => {
        setError(err.message);
        setLoadingModule(false);
      });
  }, [id, numericId]);

  if (loadingUser) return <div>Загрузка данных пользователя...</div>;
  if (loadingModule) return <div>Загрузка модуля...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!module) return <div>Модуль не найден</div>;

  const ConnectorLine = ({ from, to }) => {
    const nameHeight = 35; // Примерно высота названия
    const circleRadius = 75; // circleSize / 2

    const fromX = from.left + circleRadius;
    const fromY = from.top + nameHeight + circleRadius;

    const toX = to.left + circleRadius;
    const toY = to.top + nameHeight + circleRadius;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const ux = dx / distance;
    const uy = dy / distance;

    const startX = fromX + ux * circleRadius;
    const startY = fromY + uy * circleRadius;

    const endX = toX - ux * circleRadius;
    const endY = toY - uy * circleRadius;

    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

    return (
      <div
        className="level-connector"
        style={{
          width: lineLength,
          top: startY,
          left: startX,
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`
        }}
      />
    );
  };


  return (
    <div className="module-page">
      <div className="module-left">
        <h2>Модуль: {module.title}</h2>
        <p className="module-description">{module.text}</p>
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate(-1)}>Назад</button>
        </div>
      </div>

      <div className="levels-container">
        <div className="levels-background-wrapper">
          <div className="levels-background"></div>
        </div>

        <div
          className="levels-inner"
          style={{
            height: coordsList.length ? coordsList[coordsList.length - 1].top + circleSize + 100 : 600
          }}
        >
          {module.levels.map((level, index) => {
            const coords = coordsList[index] || { top: 0, left: 0 };

            const isInactive = user && level.levelNumber > user.currentLevelNumber + 1;

            let color;
            if (isInactive) {
              color = INACTIVE_COLOR;
            } else if (level.difficulty >= 1 && level.difficulty <= 3) {
              color = COLORS[level.difficulty - 1];
            } else {
              color = INACTIVE_COLOR;
            }

            const handleClick = () => {
              if (!isInactive) {
                fetch(`http://localhost:5246/Level/get-by/${level.id}`)
                  .then(res => {
                    if (!res.ok) throw new Error('Ошибка загрузки уровня');
                    return res.json();
                  })
                  .then(levelData => {
                    navigate(`/level/${level.id}`, { state: { level: levelData } });
                  })
                  .catch(err => {
                    alert(err.message);
                  });
              }
            };

            return (
              <React.Fragment key={level.id}>
                <div
                  className="level-wrapper"
                  style={{ top: coords.top, left: coords.left }}
                >
                  <div className="level-name">{level.name}</div>
                  <div
                    className={`level-circle ${!isInactive ? 'clickable' : ''}`}
                    style={{
                      backgroundColor: color,
                      borderColor: '#63071E',
                      color: 'white'
                    }}
                    onClick={handleClick}
                  >
                    <div className="level-number">{level.levelNumber}</div>
                  </div>
                  <div
                    className="level-difficulty"
                    style={{
                      color: level.difficulty === 1 ? '#2ecc71' :
                        level.difficulty === 2 ? '#f39c12' : '#e74c3c'
                    }}
                  >
                    {level.difficulty === 1 ? 'Легко' :
                      level.difficulty === 2 ? 'Нормально' : 'Сложно'}
                  </div>
                </div>

                {index < module.levels.length - 1 && coordsList.length > index + 1 && (
                  <ConnectorLine from={coords} to={coordsList[index + 1]} key={`connector-${level.id}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <img
        src={require('../stay.png')}
        alt="Stay"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '10vw',
          height: 'auto',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default ModulePage;
