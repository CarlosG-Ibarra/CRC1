import React, { useState, useEffect, useRef } from 'react';
import './RegistroDespensas.css'; 

function RegistroDespensas() {
  const [formData, setFormData] = useState({
    id_registro: null,
    nombre: '',
    calle: '',
    numero: '',
    colonia: '',
    cp: '',
    telefono: '',
    zona: ''
  });

  const [suggestions, setSuggestions] = useState([]);
  const [debouncedName, setDebouncedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameFinalized, setIsNameFinalized] = useState(false);
  const debounceTimer = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nombre') {
      setIsNameFinalized(false);
      clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        setDebouncedName(value);
      }, 200);
    }

    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    if (debouncedName.length > 2 && !isNameFinalized) {
      setIsLoading(true);

      // Buscar primero en la tabla Registros
      fetch(`http://localhost:3001/api/check-registros?nombre=${debouncedName}`)
        .then((response) => response.json())
        .then((data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching names:", error);
          setSuggestions([]);
          setIsLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [debouncedName, isNameFinalized]);

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      id_registro: suggestion.id_registro,
      nombre: suggestion.nombre_solicitante,
      calle: suggestion.calle,
      numero: suggestion.numero,
      colonia: suggestion.colonia,
      cp: suggestion.cp,
      telefono: suggestion.tel ? suggestion.tel.toString() : '',
      zona: suggestion.zona
    });
    
    setSuggestions([]);
    setIsNameFinalized(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        
        // Clear form
        setFormData({
          id_registro: null,
          nombre: '',
          calle: '',
          numero: '',
          colonia: '',
          cp: '',
          telefono: '',
          zona: ''
        });
        
        alert(formData.id_registro ? 'Actualización exitosa' : 'Registro exitoso');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error en la conexión, intente más tarde.');
    }
  };

  return (
    <div className="registro-despensas-container">
      <h1>Registro de Despensas</h1>
      <form onSubmit={handleSubmit}>
        <div className="registro-despensas-form-group">
          <label htmlFor="nombre">Nombre</label>
          <div className="input-with-suggestions">
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id_registro}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion.nombre_solicitante}
                  </li>
                ))}
              </ul>
            )}
            {isLoading && <div className="loading-indicator">Cargando...</div>}
          </div>
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
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            pattern="[0-9]*"
            maxLength="10"
            placeholder="10 dígitos"
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
        <button type="submit" className="registro-despensas-submit-button">{formData.id_registro ? 'Actualizar' : 'Registrar'}</button>
      </form>
    </div>
  );
}

export default RegistroDespensas;
