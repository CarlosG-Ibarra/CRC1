import React, { useState } from 'react';
import './RegistroDespensas.css'; 

function RegistroDespensas() {
  const [formData, setFormData] = useState({
    nombre: '',
    calle: '',
    numero: '',
    colonia: '',
    cp: '',
    telefono: '',
    zona: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData); // Add this line to check the form data
    try {
      const response = await fetch('http://localhost:3001/registro-despensas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registro exitoso:', data);
        // Clear form
        setFormData({
          nombre: '',
          calle: '',
          numero: '',
          colonia: '',
          cp: '',
          telefono: '',
          zona :''
        });
        alert('Registro exitoso');
      } else {
        const errorData = await response.json();
        console.error('Error en el registro:', errorData.message);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      alert('Error en la conexión, intente más tarde.');
    }
  };

  return (
    <div className="registro-despensas-container">
      <h1>Registro de Despensas</h1>
      <form onSubmit={handleSubmit}>
        <div className="registro-despensas-form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="calle">Calle</label>
          <input
            type="text"
            id="calle"
            name="calle"
            value={formData.calle}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="numero">Número</label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="colonia">Colonia</label>
          <input
            type="text"
            id="colonia"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="cp">CP</label>
          <input
            type="text"
            id="cp"
            name="cp"
            value={formData.cp}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="registro-despensas-form-group">
          <label htmlFor="zona">Zona</label>
          <input
            type="text"
            id="zona"
            name="zona"
            value={formData.zona}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="registro-despensas-submit-button">Registrar</button>
      </form>
    </div>
  );
}

export default RegistroDespensas;
