// Importaciones necesarias para el componente
import React, { useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import axios from "axios";
import "./MapaDeDespensas.css";

// Definir el array de bibliotecas como una constante fuera del componente
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

// Configuración de la API de Google Maps
const GOOGLE_MAPS_API_KEY = "AIzaSyAkE1Y9e8WFfw_f7LUrNow1_xouN3ADxUM";

// Coordenadas del centro de Chihuahua para inicializar el mapa
const CHIHUAHUA_CENTER = {
  lat: 28.6353,
  lng: -106.0889
};

// Estilo del contenedor del mapa
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

/**
 * Componente MapaDeDespensas
 * Este componente maneja la visualización y gestión de rutas de entrega de despensas.
 * Incluye un mapa interactivo, lista de despensas disponibles y seguimiento de entregas.
 */
function MapaDeDespensas() {
  // Inicialización de la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: 'weekly'
  });

  // Estados del componente
  const [registros, setRegistros] = useState([]); // Lista de todos los registros sin ruta
  const [selectedAddresses, setSelectedAddresses] = useState(() => {
    // Recuperar direcciones seleccionadas del almacenamiento local
    const savedAddresses = localStorage.getItem('selectedAddresses');
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });
  const [userLocation, setUserLocation] = useState(null); // Ubicación actual del usuario
  const [directionsResponse] = useState(null); // Respuesta de direcciones de Google Maps
  const [routeStarted, setRouteStarted] = useState(() => {
    // Recuperar estado de la ruta del almacenamiento local
    const savedRouteStarted = localStorage.getItem('routeStarted');
    return savedRouteStarted ? JSON.parse(savedRouteStarted) : false;
  });
  
  // Control de límites de uso de la API de geocodificación
  const [dailyGeocodeCount, setDailyGeocodeCount] = useState(0);
  const DAILY_GEOCODE_LIMIT = 200; // El nivel gratuito permite 300/día, establecemos un límite menor por seguridad

  /**
   * Obtiene los registros con `ruta = 0` al montar el componente
   */
  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/registros/sin-ruta"
        );
        if (!response.ok) {
          throw new Error("Error al obtener registros");
        }
        const data = await response.json();
        
        // Marcar registros como seleccionados si están en selectedAddresses
        const updatedRegistros = data.map(registro => ({
          ...registro,
          selected: selectedAddresses.some(addr => addr.id_registro === registro.id_registro)
        }));
        
        setRegistros(updatedRegistros);
      } catch (error) {
        setRegistros([]);
      }
    };
    fetchRegistros();
  }, [selectedAddresses]);

  /**
   * Solicita la ubicación del usuario
   */
  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      const success = (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      };

      const error = (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        // If geolocation fails, default to Chihuahua center
        setUserLocation(CHIHUAHUA_CENTER);
        alert("No se pudo obtener tu ubicación exacta. Usando ubicación predeterminada de Chihuahua.");
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
      // Browser doesn't support Geolocation
      setUserLocation(CHIHUAHUA_CENTER);
      alert("Tu navegador no soporta geolocalización. Usando ubicación predeterminada de Chihuahua.");
    }
  }, []);

  /**
   * Reiniciar el contador diario a medianoche
   */
  useEffect(() => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const msToMidnight = night.getTime() - now.getTime();

    // Reiniciar contador a medianoche
    const timer = setTimeout(() => {
      setDailyGeocodeCount(0);
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Guardar routeStarted en localStorage cuando cambie
   */
  useEffect(() => {
    localStorage.setItem('routeStarted', JSON.stringify(routeStarted));
  }, [routeStarted]);

  /**
   * Guardar direcciones seleccionadas en localStorage cuando cambien
   */
  useEffect(() => {
    localStorage.setItem('selectedAddresses', JSON.stringify(selectedAddresses));
  }, [selectedAddresses]);

  /**
   * Geocodifica una dirección para obtener sus coordenadas
   * @param {string} address - Dirección a geocodificar
   * @returns {Object|null} Coordenadas {lat, lng} o null si no se encuentra
   */
  const geocodeAddress = async (address) => {
    // Verificar el límite diario
    if (dailyGeocodeCount >= DAILY_GEOCODE_LIMIT) {
      alert('Se alcanzó el límite diario de búsquedas de direcciones. Por favor, intente mañana.');
      return null;
    }

    // Formatear la dirección con más estructura
    const fullAddress = `${address}, Chihuahua, CHIH, Mexico`;

    try {
      // Primero intentar con la dirección completa
      let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      let response = await axios.get(geocodeUrl);
      setDailyGeocodeCount(prev => prev + 1);

      if (response.data.status === "ZERO_RESULTS") {
        // Si la dirección completa falla, intentar solo con calle y ciudad
        const simpleAddress = `${address}, Chihuahua`;
        
        geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          simpleAddress
        )}&key=${GOOGLE_MAPS_API_KEY}`;
        
        response = await axios.get(geocodeUrl);
        setDailyGeocodeCount(prev => prev + 1);
      }

      if (response.data.status === "OVER_QUERY_LIMIT") {
        alert('Se alcanzó el límite de búsquedas de Google Maps. Por favor, intente más tarde.');
        return null;
      }

      if (response.data.status === "OK") {
        const result = response.data.results[0];
        // Verificar si el resultado está en Chihuahua
        const isInChihuahua = result.formatted_address.toLowerCase().includes('chihuahua');
        
        if (!isInChihuahua) {
          return null;
        }

        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        };
      }

      if (response.data.status === "REQUEST_DENIED") {
        return null;
      }

      return null;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert('Se alcanzó el límite de búsquedas de Google Maps. Por favor, intente más tarde.');
      }
      return null;
    }
  };

  /**
   * Maneja la selección de un registro de la lista
   * Obtiene las coordenadas si no existen y actualiza el estado
   * @param {number} registroId - ID del registro seleccionado
   */
  const handleSelectRegistro = async (registroId) => {
    const updatedRegistros = await Promise.all(
      registros.map(async (registro) => {
        if (registro.id_registro === registroId) {
          // Verificar si ya tenemos coordenadas para este registro
          const existingAddress = selectedAddresses.find(addr => addr.id_registro === registroId);
          if (existingAddress?.coordinates) {
            return {
              ...registro,
              selected: !registro.selected,
              coordinates: existingAddress.coordinates,
              addressNotFound: existingAddress.addressNotFound
            };
          }

          if (!registro.coordinates) {
            // Formatear la dirección con más cuidado
            const streetAddress = registro.numero ? 
              `${registro.calle} ${registro.numero}` : 
              registro.calle;
            
            const addressParts = [streetAddress];
            if (registro.colonia) {
              addressParts.push(registro.colonia);
            }
            
            const addressString = addressParts.join(', ');
            const coords = await geocodeAddress(addressString);
            
            return {
              ...registro,
              selected: !registro.selected,
              coordinates: coords,
              addressNotFound: coords === null
            };
          } else {
            return { ...registro, selected: !registro.selected };
          }
        }
        return registro;
      })
    );
    setRegistros(updatedRegistros);
    
    // Actualizar selectedAddresses mientras se preservan las coordenadas existentes
    const newSelectedAddresses = updatedRegistros
      .filter((registro) => registro.selected)
      .map(registro => ({
        ...registro,
        coordinates: registro.coordinates || 
          selectedAddresses.find(addr => addr.id_registro === registro.id_registro)?.coordinates
      }));
    
    setSelectedAddresses(newSelectedAddresses);
  };

  /**
   * Actualiza el estado de entrega de un registro
   * @param {number} id_registro - ID del registro
   * @param {string} status - Estado de entrega ('delivered' o 'not-delivered')
   */
  const handleDeliveryStatus = async (id_registro, status) => {
    try {
      const newRuta = status === 'delivered' ? 2 : 0;
      
      const response = await fetch(
        "http://localhost:3001/registro/actualizar-ruta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            id_registro: id_registro,
            ruta: newRuta 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de entrega");
      }

      // Actualizar estados locales
      // 1. Eliminar de selectedAddresses
      setSelectedAddresses(prev => prev.filter(addr => addr.id_registro !== id_registro));
      
      // 2. Actualizar lista de registros
      setRegistros(prev => prev.filter(reg => reg.id_registro !== id_registro));

      // 3. Si no hay más direcciones seleccionadas, reiniciar routeStarted
      const remainingAddresses = selectedAddresses.filter(addr => addr.id_registro !== id_registro);
      if (remainingAddresses.length === 0) {
        setRouteStarted(false);
        localStorage.setItem('routeStarted', 'false');
      }

      // 4. Actualizar la lista de registros si se marca como no entregada
      if (status === 'not-delivered') {
        const fetchResponse = await fetch("http://localhost:3001/registros/sin-ruta");
        if (!fetchResponse.ok) {
          throw new Error("Error al actualizar la lista de registros");
        }
        const newData = await fetchResponse.json();
        setRegistros(newData);
      }
      
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Error al actualizar el estado de la entrega");
    }
  };

  /**
   * Inicia la ruta en Google Maps con las direcciones seleccionadas
   * Actualiza el estado de los registros a 'en ruta'
   */
  const handleStartRoute = async () => {
    try {
      // Crear una copia de selectedAddresses para actualizar
      const updatedAddresses = [...selectedAddresses];

      // Actualizar la ruta a 1 (en progreso) para cada registro seleccionado
      for (const address of selectedAddresses) {
        const response = await fetch(
          "http://localhost:3001/registro/actualizar-ruta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              id_registro: address.id_registro,
              ruta: 1 
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la ruta");
        }

        // Actualizar la dirección en nuestro estado local
        const index = updatedAddresses.findIndex(addr => addr.id_registro === address.id_registro);
        if (index !== -1) {
          updatedAddresses[index] = { ...updatedAddresses[index], ruta: 1 };
        }
      }

      // Actualizar selectedAddresses con el nuevo estado de ruta
      setSelectedAddresses(updatedAddresses);

      // Abrir la ruta en Google Maps
      const waypoints = selectedAddresses
        .map(
          ({ calle, numero, colonia }) =>
            `${calle} ${numero}, ${colonia}, Chihuahua`
        )
        .map(encodeURIComponent)
        .join("|");
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${userLocation.lat},${userLocation.lng}&waypoints=${waypoints}`;
      window.open(mapsUrl, "_blank");
      
      // Establecer la ruta como iniciada para mostrar botones de entrega
      setRouteStarted(true);

    } catch (error) {
      console.error("Error al iniciar la ruta:", error);
      alert("Error al iniciar la ruta");
    }
  };

  /**
   * Limpia la selección actual de rutas
   */
  const handleClearRoute = () => {
    setRegistros(
      registros.map((registro) => ({ ...registro, selected: false }))
    );
    setSelectedAddresses([]);
  };

  // Renderizado condicional mientras se carga el mapa
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Estructura del componente
  return (
    <div className="mapa-despensas">
      {/* Sección 1: Lista de Registros No Entregados */}
      <section className="mapa-despensas__routes">
        <h2>Registros No Entregados</h2>
        <div className="mapa-despensas__header-bar">
          <span className="header-item">Nombre</span>
          <span className="header-item">Colonia</span>
          <span className="header-item">Zona</span>
        </div>
        <ul>
          {registros
            .filter((registro) => !registro.selected)
            .map((registro) => (
              <li
                key={registro.id_registro}
                onClick={() => handleSelectRegistro(registro.id_registro)}
                className={`registro-item ${
                  registro.selected ? "selected" : ""
                }`}
              >
                <span className="registro-item__nombre">
                  {registro.nombre_solicitante}
                </span>
                <span className="registro-item__colonia">
                  {registro.colonia}
                </span>
                <span className="registro-item__zona">{registro.zona}</span>
              </li>
            ))}
        </ul>
      </section>

      {/* Sección 2: Mapa Interactivo de Google */}
      <section className="mapa-despensas__map">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={CHIHUAHUA_CENTER}
          zoom={13}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            minZoom: 8,
            maxZoom: 18,
            restriction: {
              latLngBounds: {
                north: 29.0353, 
                south: 28.2353, 
                east: -105.7889, 
                west: -106.3889, 
              },
              strictBounds: false
            }
          }}
        >
          {userLocation && (
            <MarkerF
              position={userLocation}
              title="Ubicación del usuario"
            />
          )}
          {selectedAddresses
            .filter((address) => address.coordinates && !address.addressNotFound)
            .map((address) => (
              <MarkerF
                key={address.id_registro}
                position={address.coordinates}
                title={`${address.nombre_solicitante} - ${address.calle} ${address.numero}, ${address.colonia}`}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                }}
              />
            ))}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </section>

      {/* Sección 3: Lista de Direcciones Seleccionadas */}
      <section className="mapa-despensas__selected">
        <h3>Direcciones Seleccionadas:</h3>
        <ul className="mapa-despensas__selected-list">
          {selectedAddresses.map((address) => (
            <li
              key={address.id_registro}
              className="mapa-despensas__selected-item"
            >
              <div className="address-info">
                <span className="mapa-despensas__address-name">
                  {address.nombre_solicitante}
                </span>
                <br />
                <span className="mapa-despensas__address-street">
                  {address.calle} {address.numero}
                </span>
                <br />
                <span className="mapa-despensas__address-colonia">
                  {address.colonia}
                </span>
                {address.addressNotFound && (
                  <span className="mapa-despensas__warning">
                    ⚠️ Dirección no encontrada - Verificar con el solicitante
                  </span>
                )}
              </div>
              {routeStarted && address.ruta === 1 && (
                <div className="delivery-buttons">
                  <button
                    className="btn-delivered"
                    onClick={() => handleDeliveryStatus(address.id_registro, 'delivered')}
                  >
                    Entregada
                  </button>
                  <button
                    className="btn-not-delivered"
                    onClick={() => handleDeliveryStatus(address.id_registro, 'not-delivered')}
                  >
                    No Entregada
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Sección 4: Botones de Control de Ruta */}
      <section className="mapa-despensas__actions">
        <button
          onClick={handleStartRoute}
          disabled={selectedAddresses.length === 0}
        >
          Iniciar Ruta
        </button>
        <button
          className="mapa-despensas__clear-button"
          onClick={handleClearRoute}
        >
          Limpiar Ruta
        </button>
      </section>
    </div>
  );
}

export default MapaDeDespensas;
