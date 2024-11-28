import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faMap,
  faClipboard,
  faSearch,
  faSignOutAlt,
  faCloud,
  faSun,
  faCloudRain,
  faSnowflake,
  faUserLarge,
  faAddressBook,
  faFileImport,
} from "@fortawesome/free-solid-svg-icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [date, setDate] = useState(new Date());
  const [despensas, setDespensas] = useState([]);  // Initialize as empty array instead of null
  const [scrollDirection, setScrollDirection] = useState('down');
  const despensasListRef = useRef(null);

  // Fetch the logged-in user's info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const nivel = user?.nivel; // Getting the user's level

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const lat = 28.6353;
        const lon = -106.0889;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Mexico_City`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los datos del clima");
        }
        const data = await response.json();
        setWeatherData(data.current_weather);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchWeatherData();

    const fetchDespensas = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/despensas/sin-ruta"
        );
        if (!response.ok) {
          throw new Error("Error al obtener despensas");
        }
        const data = await response.json();
        console.log("Datos de despensas:", data);
        setDespensas(data);
      } catch (error) {
        console.error("Error al obtener despensas:", error);
        setDespensas([]);
      }
    };
    fetchDespensas();
  }, []);

  useEffect(() => {
    let scrollInterval;
    
    if (despensas && despensas.length > 5) {
      scrollInterval = setInterval(() => {
        if (despensasListRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = despensasListRef.current;
          
          if (scrollDirection === 'down') {
            if (scrollTop + clientHeight >= scrollHeight) {
              // Reached bottom, change direction
              setScrollDirection('up');
            } else {
              despensasListRef.current.scrollBy({ top: 1, behavior: 'smooth' });
            }
          } else {
            if (scrollTop <= 0) {
              // Reached top, change direction
              setScrollDirection('down');
            } else {
              despensasListRef.current.scrollBy({ top: -1, behavior: 'smooth' });
            }
          }
        }
      }, 50);
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [despensas, scrollDirection]);

  return (
    <div className="dashboard-content">
      <h1 className="h1title">Página principal</h1>

      <div className="options-container">
        <Link to="/registre-despensas" className="option-button-dashboard">
          <FontAwesomeIcon
            icon={faClipboard}
            className="button-icon-dashboard"
          />
          Registro De Apoyos
        </Link>
        <Link to="/entregar-despensas" className="option-button-dashboard">
          <FontAwesomeIcon
            icon={faBagShopping}
            className="button-icon-dashboard"
          />
          Entrega De Apoyos
        </Link>
        <Link to="/map" className="option-button-dashboard">
          <FontAwesomeIcon icon={faMap} className="button-icon-dashboard" />
          Mapa De Despensas
        </Link>
        <Link to="/vales-salidas" className="option-button-dashboard">
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="button-icon-dashboard"
          />
          Vales De Salida
        </Link>
        <Link to="/entrada-vales" className="option-button-dashboard">
          <FontAwesomeIcon
            icon={faFileImport}
            className="button-icon-dashboard"
          />
          Vales de Entrada
        </Link>
        <Link to="/vales-consultas" className="option-button-dashboard">
          <FontAwesomeIcon icon={faSearch} className="button-icon-dashboard" />
          Consulta De Vales
        </Link>

        {/* Conditionally render this link only if nivel is 1 */}
        {nivel === 1 && (
          <Link to="/Administracion" className="option-button-dashboard">
            <FontAwesomeIcon
              icon={faAddressBook}
              className="button-icon-dashboard"
            />
            Administración de Acceso
          </Link>
        )}
      </div>

      <div className="info-boxes">
        <div className="weather-box">
          <h3>Clima</h3>
          {weatherData && (
            <>
              <FontAwesomeIcon
                icon={
                  weatherData.weathercode === 0
                    ? faSun
                    : weatherData.weathercode <= 3
                    ? faCloud
                    : weatherData.weathercode <= 69
                    ? faCloudRain
                    : faSnowflake
                }
                className="weather-icon"
              />
              <span className="weather-temp">{weatherData.temperature}°C</span>
              <span className="weather-description">
                {weatherData.weathercode === 0
                  ? "Despejado"
                  : weatherData.weathercode <= 3
                  ? "Parcialmente Nublado"
                  : weatherData.weathercode <= 69
                  ? "Lluvioso"
                  : "Nevado"}
              </span>
            </>
          )}
        </div>

        <div className="info-box">
          <h3>Calendario</h3>
          <Calendar onChange={setDate} value={date} className="calendar" />
        </div>

        <div className="info-box">
          <h3>Despensas a entregar</h3>
          {despensas.length === 0 ? (
            <p>No hay despensas para hoy.</p>
          ) : (
            <ul 
              className="despensa-list"
              ref={despensasListRef}
              onMouseEnter={() => {
                if (despensasListRef.current) {
                  despensasListRef.current.style.scrollBehavior = 'auto';
                  despensasListRef.current.style.overflowY = 'auto';
                }
              }}
              onMouseLeave={() => {
                if (despensasListRef.current) {
                  despensasListRef.current.style.scrollBehavior = 'smooth';
                  despensasListRef.current.style.overflowY = 'hidden';
                }
              }}
            >
              {despensas.map((despensa, index) => (
                <li key={index} className="despensa-item">
                  <div className="despensa-icon">
                    <FontAwesomeIcon icon={faUserLarge} />
                  </div>
                  <div className="despensa-content">
                    <span className="despensa-nombre">
                      {despensa.nombre_solicitante}
                    </span>{" "}
                    <br></br>
                    <span className="despensa-colonia">{despensa.colonia}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
