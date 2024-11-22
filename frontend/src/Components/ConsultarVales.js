import React, { useState, useEffect } from 'react';
import './ConsultarVales.css';
import axios from 'axios';

const formatFecha = (fecha) => {
  if (!fecha) return ''; // Previene errores si la fecha es null o undefined
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function BuscadorVales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVales, setFilteredVales] = useState([]);
  const [selectedVale, setSelectedVale] = useState(null); // Almacena el vale seleccionado
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    let isMounted = true; // Bandera para indicar si el componente está montado
    if (searchTerm === '') return; // Evita la llamada si no hay término de búsqueda
  
    const fetchVales = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.get(`http://localhost:3001/registro_vales?term=${searchTerm}`);
  
        if (response.status === 200 && isMounted) {
          const data = response.data;
          const updatedData = data.map(vale => {
            if (vale.firma_entrega) {
              vale.firma_entrega = `data:image/png;base64,${vale.firma_entrega}`;
            }
            if (vale.firma_recibe) {
              vale.firma_recibe = `data:image/png;base64,${vale.firma_entrega}`;
            }
            return vale;
          });
  
          if (isMounted) {
            setFilteredVales(updatedData);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Error al buscar los vales. Intente nuevamente más tarde.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchVales();
  
    return () => {
      isMounted = false; // Marca el componente como desmontado
    };
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleValeClick = (vale) => {
    setSelectedVale(vale); // Almacena el vale seleccionado
  };

  const handleBack = () => {
    setSelectedVale(null); // Vuelve a la lista de vales
  };

  return (
    <div className="buscador-vales-container">
      <h1 className="buscador-vales-title">Buscar Vales</h1>
      <input
        type="text"
        placeholder="Buscar por fecha, dependencia o solicitante..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="buscador-vales-input"
        maxLength="100" // Limitar el tamaño del término de búsqueda
      />

      {loading && <p>Cargando...</p>} {/* Mensaje de carga */}

      {error && <p className="error-message">{error}</p>} {/* Mensaje de error */}

      {selectedVale ? (
        <div className="vale-detalle">
          <h2>Detalle del Vale</h2>
          <p><strong>Fecha:</strong> {formatFecha(selectedVale.fecha_entrega)}</p>
          <p><strong>Solicitante:</strong> {selectedVale.solicitante}</p>
          <p><strong>Dependencia:</strong> {selectedVale.dependencia}</p>
          <p><strong>Despensas:</strong> {selectedVale.cantidad_despensas}</p>
          <p><strong>Mochilas Primaria:</strong> {selectedVale.cantidad_mochilas_primaria}</p>
          <p><strong>Mochilas Secundaria:</strong> {selectedVale.cantidad_mochilas_secundaria}</p>
          <p><strong>Mochilas Preparatoria:</strong> {selectedVale.cantidad_mochilas_preparatoria}</p>
          <p><strong>Colchonetas:</strong> {selectedVale.cantidad_colchonetas}</p>
          <p><strong>Aguas:</strong> {selectedVale.cantidad_aguas}</p>
          <p><strong>Pintura:</strong> {selectedVale.cantidad_botes_pintura}</p>
          <p><strong>Impermeabilizante:</strong> {selectedVale.cantidad_botes_impermeabilizante}</p>
          <p><strong>Bicicletas:</strong> {selectedVale.cantidad_bicicletas}</p>
          <p><strong>Mesas:</strong> {selectedVale.cantidad_mesas}</p>
          <p><strong>Sillas:</strong> {selectedVale.cantidad_sillas}</p>
          <p><strong>Dulces:</strong> {selectedVale.cantidad_dulces}</p>
          <p><strong>Piñatas:</strong> {selectedVale.cantidad_piñatas}</p>
          <p><strong>Juguetes:</strong> {selectedVale.cantidad_juguetes}</p>
          {/* Otras propiedades del vale... */}
          
          {/* Mostrar las firmas como imágenes */}
          <div>
            <p><strong>Firma de quien entrega:</strong></p>
            {selectedVale.firma_entrega && (
              <img 
                src={selectedVale.firma_entrega} 
                alt="Firma entrega" 
                style={{ width: '300px', height: 'auto', border: '1px solid black', marginTop: '10px' }} 
              />
            )}
          </div>
          <div>
            <p><strong>Firma de quien recibe:</strong></p>
            {selectedVale.firma_recibe && (
              <img 
                src={selectedVale.firma_recibe} 
                alt="Firma recibe" 
                style={{ width: '300px', height: 'auto', border: '1px solid black', marginTop: '10px' }} 
              />
            )}
          </div>

          <button onClick={handleBack} className="vale-back-button">Volver</button>
        </div>
      ) : (
        <div className="buscador-vales-list">
          {filteredVales.length > 0 ? (
            filteredVales.map((vale) => (
              <div
                key={vale.id}
                className="buscador-vales-item"
                onClick={() => handleValeClick(vale)} // Maneja el clic en un vale
              >
                <p><strong>Fecha:</strong> {formatFecha(vale.fecha_entrega)}</p>
                <p><strong>Dependencia:</strong> {vale.dependencia}</p>
                <p><strong>Solicitante:</strong> {vale.solicitante}</p>
              </div>
            ))
          ) : (
            <p>No se encontraron resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BuscadorVales;
