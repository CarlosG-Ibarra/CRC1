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

function ConsultarVales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [vales, setVales] = useState([]);
  const [selectedVale, setSelectedVale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vales when component mounts or search terms change
  useEffect(() => {
    const fetchVales = async () => {
      setLoading(true);
      setError(null);
      try {
        // Combine text search and date filter
        const searchParams = new URLSearchParams();
        if (searchTerm) searchParams.append('term', searchTerm);
        if (dateFilter) searchParams.append('date', dateFilter);
        
        const url = `http://localhost:3001/registro_vales?${searchParams.toString()}`;
        
        const response = await axios.get(url);
        
        if (response.status === 200) {
          const data = response.data;
          const updatedData = data.map(vale => {
            if (vale.firma_entrega) {
              vale.firma_entrega = `data:image/png;base64,${vale.firma_entrega}`;
            }
            if (vale.firma_recibe) {
              vale.firma_recibe = `data:image/png;base64,${vale.firma_recibe}`;
            }
            return vale;
          });
          setVales(updatedData);
        }
      } catch (error) {
        setError('Error al obtener los vales. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchVales();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, dateFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDateChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleValeClick = (vale) => {
    setSelectedVale(vale);
  };

  const handleBack = () => {
    setSelectedVale(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
  };

  return (
    <div className="buscador-vales-container">
      <h1 className="buscador-vales-title">Consultar Vales</h1>
      
      <div className="search-container">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Buscar por tipo, solicitante o dependencia..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="filter-input search-text"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateChange}
            className="filter-input search-date"
          />
          <button 
            onClick={clearFilters}
            className="filter-input clear-button"
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="error-message">{error}</p>}

      {selectedVale ? (
        <div className="vale-detalle">
          <h2>Detalle del Vale</h2>
          <p><strong>Fecha:</strong> {formatFecha(selectedVale.fecha_entrega)}</p>
          <p><strong>Tipo:</strong> {selectedVale.tipo.charAt(0).toUpperCase() + selectedVale.tipo.slice(1)}</p>
          <p><strong>Solicitante:</strong> {selectedVale.solicitante}</p>
          <p><strong>Recipiente:</strong> {selectedVale.recipiente}</p>
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
          
          <div className="firmas-container">
            <div className="firma">
              <p><strong>Firma de quien entrega:</strong></p>
              {selectedVale.firma_entrega && (
                <img 
                  src={`http://localhost:3001/FirmasVales/${selectedVale.firma_entrega.replace('data:image/png;base64,', '')}`}
                  alt="Firma entrega" 
                  className="firma-imagen"
                  onError={(e) => {
                    e.target.onerror = null;
                  }}
                />
              )}
            </div>
            <div className="firma">
              <p><strong>Firma de quien recibe:</strong></p>
              {selectedVale.firma_recibe && (
                <img 
                  src={`http://localhost:3001/FirmasVales/${selectedVale.firma_recibe.replace('data:image/png;base64,', '')}`}
                  alt="Firma recibe" 
                  className="firma-imagen"
                  onError={(e) => {
                    e.target.onerror = null;
                  }}
                />
              )}
            </div>
          </div>

          <button onClick={handleBack} className="vale-back-button">Volver</button>
        </div>
      ) : (
        <div className="buscador-vales-list">
          {vales.length > 0 ? (
            vales.map((vale) => (
              <div
                key={vale.id}
                className="buscador-vales-item"
                onClick={() => handleValeClick(vale)}
              >
                <p><strong>Fecha:</strong> {formatFecha(vale.fecha_entrega)}</p>
                <p><strong>Tipo:</strong> {vale.tipo.charAt(0).toUpperCase() + vale.tipo.slice(1)}</p>
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

export default ConsultarVales;
