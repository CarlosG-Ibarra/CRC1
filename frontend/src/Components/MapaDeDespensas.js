import React, { useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import axios from "axios";
import "./MapaDeDespensas.css";

// Definir el array de bibliotecas como una constante fuera del componente
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

// Opciones de carga de Google Maps
const GOOGLE_MAPS_API_KEY = "";

// Coordenadas del centro de Chihuahua
const CHIHUAHUA_CENTER = {
  lat: 28.6353,
  lng: -106.0889
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

function MapaDeDespensas() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: 'weekly'
  });

  const [despensas, setDespensas] = useState([]);
  const [selectedAddresses, setSelectedAddresses] = useState(() => {
    // Cargar direcciones guardadas desde localStorage al montar el componente
    const savedAddresses = localStorage.getItem('selectedAddresses');
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });
  const [userLocation, setUserLocation] = useState(null);
  const [directionsResponse] = useState(null);
  const [routeStarted, setRouteStarted] = useState(() => {
    const savedRouteStarted = localStorage.getItem('routeStarted');
    return savedRouteStarted ? JSON.parse(savedRouteStarted) : false;
  });
  // Agregar seguimiento de uso
  const [dailyGeocodeCount, setDailyGeocodeCount] = useState(0);
  const DAILY_GEOCODE_LIMIT = 200; // El nivel gratuito permite 300/día, establecemos un límite menor por seguridad

  // Obtiene las despensas con `ruta = 0` al montar el componente
  useEffect(() => {
    const fetchDespensas = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/despensas/sin-ruta"
        );
        if (!response.ok) {
          throw new Error("Error al obtener despensas");
        }
        const data = await response.json();
        
        // Marcar despensas como seleccionadas si están en selectedAddresses
        const updatedDespensas = data.map(despensa => ({
          ...despensa,
          selected: selectedAddresses.some(addr => addr.id_despensa === despensa.id_despensa)
        }));
        
        setDespensas(updatedDespensas);
      } catch (error) {
        setDespensas([]);
      }
    };
    fetchDespensas();
  }, [selectedAddresses]);

  // Solicita la ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  // Reiniciar el contador diario a medianoche
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

  // Guardar routeStarted en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('routeStarted', JSON.stringify(routeStarted));
  }, [routeStarted]);

  // Guardar direcciones seleccionadas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('selectedAddresses', JSON.stringify(selectedAddresses));
  }, [selectedAddresses]);

  // Geocodifica la dirección para obtener las coordenadas
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

  // Maneja la selección de una despensa
  const handleSelectDespensa = async (despensaId) => {
    const updatedDespensas = await Promise.all(
      despensas.map(async (despensa) => {
        if (despensa.id_despensa === despensaId) {
          // Verificar si ya tenemos coordenadas para esta despensa
          const existingAddress = selectedAddresses.find(addr => addr.id_despensa === despensaId);
          if (existingAddress?.coordinates) {
            return {
              ...despensa,
              selected: !despensa.selected,
              coordinates: existingAddress.coordinates,
              addressNotFound: existingAddress.addressNotFound
            };
          }

          if (!despensa.coordinates) {
            // Formatear la dirección con más cuidado
            const streetAddress = despensa.numero ? 
              `${despensa.calle} ${despensa.numero}` : 
              despensa.calle;
            
            const addressParts = [streetAddress];
            if (despensa.colonia) {
              addressParts.push(despensa.colonia);
            }
            
            const addressString = addressParts.join(', ');
            const coords = await geocodeAddress(addressString);
            
            return {
              ...despensa,
              selected: !despensa.selected,
              coordinates: coords,
              addressNotFound: coords === null
            };
          } else {
            return { ...despensa, selected: !despensa.selected };
          }
        }
        return despensa;
      })
    );
    setDespensas(updatedDespensas);
    
    // Actualizar selectedAddresses mientras se preservan las coordenadas existentes
    const newSelectedAddresses = updatedDespensas
      .filter((despensa) => despensa.selected)
      .map(despensa => ({
        ...despensa,
        coordinates: despensa.coordinates || 
          selectedAddresses.find(addr => addr.id_despensa === despensa.id_despensa)?.coordinates
      }));
    
    setSelectedAddresses(newSelectedAddresses);
  };

  // Función para manejar el estado de entrega
  const handleDeliveryStatus = async (id_despensa, status) => {
    try {
      const newRuta = status === 'delivered' ? 2 : 0;
      
      const response = await fetch(
        "http://localhost:3001/despensa/actualizar-ruta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            id_despensa: id_despensa,
            ruta: newRuta 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de entrega");
      }

      // Actualizar estados locales
      // 1. Eliminar de selectedAddresses
      setSelectedAddresses(prev => prev.filter(addr => addr.id_despensa !== id_despensa));
      
      // 2. Actualizar lista de despensas
      setDespensas(prev => prev.filter(desp => desp.id_despensa !== id_despensa));

      // 3. Si no hay más direcciones seleccionadas, reiniciar routeStarted
      const remainingAddresses = selectedAddresses.filter(addr => addr.id_despensa !== id_despensa);
      if (remainingAddresses.length === 0) {
        setRouteStarted(false);
        localStorage.setItem('routeStarted', 'false');
      }

      // 4. Actualizar la lista de despensas si se marca como no entregada
      if (status === 'not-delivered') {
        const fetchResponse = await fetch("http://localhost:3001/despensas/sin-ruta");
        if (!fetchResponse.ok) {
          throw new Error("Error al actualizar la lista de despensas");
        }
        const newData = await fetchResponse.json();
        setDespensas(newData);
      }
      
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Error al actualizar el estado de la entrega");
    }
  };

  // Inicia la ruta en Google Maps con las direcciones seleccionadas
  const handleStartRoute = async () => {
    try {
      // Crear una copia de selectedAddresses para actualizar
      const updatedAddresses = [...selectedAddresses];

      // Actualizar la ruta a 1 (en progreso) para cada despensa seleccionada
      for (const address of selectedAddresses) {
        const response = await fetch(
          "http://localhost:3001/despensa/actualizar-ruta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              id_despensa: address.id_despensa,
              ruta: 1 
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la ruta");
        }

        // Actualizar la dirección en nuestro estado local
        const index = updatedAddresses.findIndex(addr => addr.id_despensa === address.id_despensa);
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

  // Limpia la selección de rutas
  const handleClearRoute = () => {
    setDespensas(
      despensas.map((despensa) => ({ ...despensa, selected: false }))
    );
    setSelectedAddresses([]);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mapa-despensas">
      {/* Sección de Rutas Disponibles */}
      <section className="mapa-despensas__routes">
        <h2>Despensas No Entregadas</h2>
        <div className="mapa-despensas__header-bar">
          <span className="header-item">Nombre</span>
          <span className="header-item">Colonia</span>
          <span className="header-item">Zona</span>
        </div>
        <ul>
          {despensas
            .filter((despensa) => !despensa.selected)
            .map((despensa) => (
              <li
                key={despensa.id_despensa}
                onClick={() => handleSelectDespensa(despensa.id_despensa)}
                className={`despensa-item ${
                  despensa.selected ? "selected" : ""
                }`}
              >
                <span className="despensa-item__nombre">
                  {despensa.nombre_solicitante}
                </span>
                <span className="despensa-item__colonia">
                  {despensa.colonia}
                </span>
                <span className="despensa-item__zona">{despensa.zona}</span>
              </li>
            ))}
        </ul>
      </section>

      {/* Mapa de Google */}
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
                key={address.id_despensa}
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

      {/* Direcciones Seleccionadas */}
      <section className="mapa-despensas__selected">
        <h3>Direcciones Seleccionadas:</h3>
        <ul className="mapa-despensas__selected-list">
          {selectedAddresses.map((address) => (
            <li
              key={address.id_despensa}
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
                    onClick={() => handleDeliveryStatus(address.id_despensa, 'delivered')}
                  >
                    Entregada
                  </button>
                  <button
                    className="btn-not-delivered"
                    onClick={() => handleDeliveryStatus(address.id_despensa, 'not-delivered')}
                  >
                    No Entregada
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Botones de Acción */}
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
