import React, { useState } from "react";
import axios from "axios";
import "./AdministracionAlta.css";

const AdministracionAlta = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nivel: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (formData.nivel === "" || isNaN(formData.nivel)) {
      setError("El nivel debe ser un número válido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:3001/register",
          {
            nombre: formData.name,
            email: formData.email,
            pass: formData.password,
            nivel: formData.nivel,
          },
          {
            headers: {
              "Content-Type": "application/json", // Ensure the content type is JSON
            },
          }
        );

        alert("Usuario registrado exitosamente!");
        console.log(response.data);
        // Reset form data after successful registration
        setFormData({
          name: "",
          email: "",
          password: "",
          nivel: "",
        });
      } catch (error) {
        setError("Hubo un error al registrar el usuario.");
        console.error(
          "Error details:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-image">
        <img src={require("../Assets/Fondoregistro.png")} alt="Fondoo" />
      </div>
      <div className="registration-form-container">
        <h2>Registro de Nuevos Usuarios</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nivel</label>
            <input
              type="number"
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="continue-button">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdministracionAlta;
