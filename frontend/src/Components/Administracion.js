import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faClipboard, faTrash } from "@fortawesome/free-solid-svg-icons"; // Updated icons
import "./Administracion.css";

const Administracion= () => {
  return (
    <div className="Administracion-content">
      <div className="Administracion-container">
        <Link to="/AdministracionAlta" className="option-button-dashboard">
          <FontAwesomeIcon icon={faAdd} className="button-icon-dashboard" />
          Alta De Usuario
        </Link>
        <Link to="/AdministracionCon" className="option-button-dashboard">
          <FontAwesomeIcon icon={faClipboard} className="button-icon-dashboard" />
          Consultar Usuarios
        </Link>
        <Link to="/AdministracionBaja" className="option-button-dashboard">
          <FontAwesomeIcon icon={faTrash} className="button-icon-dashboard" />
          Baja de Usuario
        </Link>
      </div>
    </div>
  );
};

export default Administracion;
