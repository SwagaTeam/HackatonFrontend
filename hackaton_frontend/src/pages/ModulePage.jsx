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
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const navigate = useNavigate();

  const { user, loading: loadingUser } = useContext(UserContext);

  const numericId = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + 1;

  const circleSize = 120;
  const circleBorder = 4;
  const circleRadius = circleSize / 2 + circleBorder;

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
        const maxRight = window.innerWidth - circleSize - 20; // отступ справа 20px
        const maxBottom = window.innerHeight - circleSize - 20; // отступ снизу 20px

        const calculatedCoords = data.levels.map((level, index) => {
          const offsetXRaw = (pseudoRandom(numericId * 5000 + index * 91) * 2 - 1) * MAX_HORIZONTAL_OFFSET;
          let offsetX = BASE_LEFT + offsetXRaw;

          // Ограничиваем offsetX чтобы не выходить за maxRight и не выходить за левый край (min 20)
          offsetX = Math.min(Math.max(offsetX, 20), maxRight);

          let posY;
          if (!prevCoord) {
            posY = pseudoRandom(numericId * 1000 + index * 37) * MIN_VERTICAL_GAP * 2;
          } else {
            posY = prevCoord.top + MIN_VERTICAL_GAP;
            const verticalJitter = (pseudoRandom(numericId * 2000 + index * 57) - 0.5) * MIN_VERTICAL_GAP / 2;
            posY += verticalJitter;

            const dx = offsetX - prevCoord.left;
            const dy = posY - prevCoord.top;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MIN_DISTANCE) {
              const neededDy = Math.sqrt(MIN_DISTANCE * MIN_DISTANCE - dx * dx);
              posY = prevCoord.top + neededDy;
            }
          }

          // Ограничиваем posY чтобы не выходить за maxBottom и не быть меньше 20
          posY = Math.min(Math.max(posY, 20), maxBottom);

          const coord = { top: posY, left: offsetX };
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

  // Отслеживаем изменение размера окна (ширина и высота)
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loadingUser) return <div>Загрузка данных пользователя...</div>;
  if (loadingModule) return <div>Загрузка модуля...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!module) return <div>Модуль не найден</div>;

  const ConnectorLine = ({ from, to }) => {
    const nameHeight = 35;
    const wrapperWidth = 160;
    const circleSize = 120;
    const circleBorder = 4;
    const circleDiameter = circleSize + 2 * circleBorder; // 128px
    const circleRadius = circleDiameter / 2; // 64px

    // Центры кругов внутри wrapper
    const centerXFrom = from.left + (wrapperWidth - circleDiameter) / 2 + circleRadius;
    const centerYFrom = from.top + nameHeight + circleRadius;

    const centerXTo = to.left + (wrapperWidth) / 2;
    const centerYTo = to.top + nameHeight + circleRadius;

    let dx = centerXTo - centerXFrom;
    let dy = centerYTo - centerYFrom;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) distance = 0.01; // чтобы избежать деления на 0

    // Нормализованный вектор направления
    const ux = dx / distance;
    const uy = dy / distance;

    // Начало линии — от края первого круга
    const startX = centerXFrom + ux * circleRadius;
    const startY = centerYFrom + uy * circleRadius;

    const endX = centerXTo - ux * circleRadius;
    const endY = centerYTo - uy * circleRadius;

    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) + 20;

    // Угол для поворота линии
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

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

            // Адаптация left для мобилки
            let adjustedLeft = coords.left;
            if (screenWidth <= 768) {
              adjustedLeft = Math.max(coords.left, 20);
            }

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
                  style={{ top: coords.top, left: adjustedLeft }}
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
                  <ConnectorLine from={{top: coords.top, left: adjustedLeft}} to={coordsList[index + 1]} key={`connector-${level.id}`} />
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
