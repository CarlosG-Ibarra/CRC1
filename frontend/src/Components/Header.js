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
        navigate('/'); // Redirect to the main page on logout
    };

    const handleBackClick = () => {
        // Check if the current path is one of the administrative pages
        if (location.pathname === '/AdministracionAlta' || location.pathname === '/AdministracionBaja' || location.pathname === '/AdministracionCon') {
            navigate('/Administracion'); // Navigate back to /Administracion
        } else {
            navigate('/'); // Default behavior: navigate back to the main page
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
