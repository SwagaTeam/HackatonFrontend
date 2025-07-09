import { NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="main-header">
      <div className="left-section">
        <img src="/logo.png" alt="Логотип" className="logo" />
        <div className="divider"></div> {/* 🔥 добавили разделитель */}
        <span className="course-title">Кошелёк и жизнь: курс об управлении личными финансами</span>
      </div>
      <div className="right-section">
        <NavLink to="/profile">
          <img
            src="/user_icon.png"
            alt="Профиль"
            className="profile-icon"
          />
        </NavLink>
      </div>
    </header>
  );
}
