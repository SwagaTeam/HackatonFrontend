import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import './ProfilePage.css'; // Если нужно, добавь CSS

const ProfilePage = () => {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return <div className="profile-wrapper">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="profile-wrapper">Пользователь не найден</div>;
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-card">
                <h1 className="profile-title">Профиль пользователя</h1>
                <p><strong>Логин:</strong> {user.login}</p>
                <p><strong>Пройдено уровней:</strong> {user.currentLevelNumber ?? 0}</p>
            </div>
        </div>
    );
};

export default ProfilePage;
