import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/login', {
                email: username,
                pass: password, // Cambiar 'password' a 'pass' para consistencia con el backend
            });

            if (response.status === 200) {
                onLogin(response.data.user);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Error de conexión, intente más tarde');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2 className="login-title">Login</h2>
                <div>
                    <input
                        type="text"
                        placeholder="Usuario (Email)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Login'}
                </button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
        </div>
    );
}

export default Login;