import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Header from './Components/Header';
import EntregarDespensas from './Components/EntregarDespensas';
import ValesSalida from './Components/ValesSalida';
import Footer from './Components/Footer'; 
import MapaDeDespensas from './Components/MapaDeDespensas'; 
import './index.css';
import RegistroDespensas from './Components/RegistroDespensas';
import ConsultarVales from './Components/ConsultarVales';
import Dashboard from './Components/Dashboard.js';
import Administracion from './Components/Administracion.js';
import AdministracionAlta from './Components/AdministracionAlta.js';
import AdministracionBaja from './Components/AdministracionBaja.js';
import AdministracionCon from './Components/AdministracionCon.js';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <Router>
            {user && <Header onLogout={handleLogout} isLoggedIn={!!user} />}
            <Routes>
                <Route path="/" element={user ? <Dashboard /> : <Login onLogin={handleLogin} />} />
                
                <Route path="/entregar-despensas" element={user ? <EntregarDespensas /> : <Navigate to="/" />} />
                <Route path="/vales-salidas" element={user ? <ValesSalida /> : <Navigate to="/" />} />
                <Route path="/map" element={user ? <MapaDeDespensas /> : <Navigate to="/" />} />
                <Route path="/registre-despensas" element={user ? <RegistroDespensas /> : <Navigate to="/" />} />  
                <Route path="/vales-consultas" element={user ? <ConsultarVales /> : <Navigate to="/" />} /> 
                

                <Route path="/Administracion" element={user?.nivel === 1 ? <Administracion /> : <Navigate to="/" />} />
                <Route path="/AdministracionAlta" element={user?.nivel === 1 ? <AdministracionAlta /> : <Navigate to="/" />} />
                <Route path="/AdministracionBaja" element={user?.nivel === 1 ? <AdministracionBaja /> : <Navigate to="/" />} />
                <Route path="/AdministracionCon" element={user?.nivel === 1 ? <AdministracionCon /> : <Navigate to="/" />} />
            </Routes>
            {user && <Footer />}
        </Router>
    );
}

export default App;