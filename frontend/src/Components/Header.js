import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import logo from '../Assets/logo.png';
import './Header.css';

function Header({ onLogout, isLoggedIn }) {
    const [showLogout, setShowLogout] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleMouseEnter = () => {
        setShowLogout(true);
    };

    const handleMouseLeave = () => {
        setShowLogout(false);
    };

    const handleLogout = () => {
        onLogout();
        navigate('/'); // Redirigir a la página principal al cerrar sesión
    };

    const handleBackClick = () => {
        // Verificar si la ruta actual es una de las páginas administrativas
        if (location.pathname === '/AdministracionAlta' || location.pathname === '/AdministracionBaja' || location.pathname === '/AdministracionCon') {
            navigate('/Administracion'); // Navegar de vuelta a /Administracion
        } else {
            navigate('/'); // Comportamiento predeterminado: navegar de vuelta a la página principal
        }
    };
    

    return (
        <header className="header">
            <div className="header-logo-container">
                <img src={logo} alt="Header Logo" className="header-logo" />
            </div>
            <div className="header-background"></div>
            <div className="header-content">
                {isLoggedIn && location.pathname !== '/' && (
                    <div className="back-icon-container" onClick={handleBackClick}>
                        <FaArrowLeft size={32} className="back-icon" />
                    </div>
                )}
                {isLoggedIn && (
                    <div
                        className="profile-icon-container"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <FaUserCircle size={45} className="profile-icon" />
                        {showLogout && (
                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
