import React, { useState, useEffect, useRef } from 'react';
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

  const [suggestions, setSuggestions] = useState([]);
  const [debouncedName, setDebouncedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameFinalized, setIsNameFinalized] = useState(false);
  const debounceTimer = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nombre') {
      // Reset the finalized flag and clear the timer when typing
      setIsNameFinalized(false);
      clearTimeout(debounceTimer.current);

      // Debounce the name input
      debounceTimer.current = setTimeout(() => {
        setDebouncedName(value);
      }, 200);
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    if (debouncedName.length > 2 && !isNameFinalized) {
      setIsLoading(true);
      console.log("Fetching data for:", debouncedName);

      fetch(`http://localhost:3001/api/check-delivery?nombre=${debouncedName}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Response data:", data);
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
    setFormData((prevData) => ({
      ...prevData,
      nombre: suggestion.nombre_solicitante,
      calle: suggestion.calle,
      numero: suggestion.numero,
      colonia: suggestion.colonia,
      cp: suggestion.cp,
      telefono: suggestion.tel,
      zona: suggestion.zona
    }));
    
    setSuggestions([]);
    setIsNameFinalized(true);
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
                    key={suggestion.id_despensa}
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
