import React, { useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import axios from "axios";
import "./MapaDeDespensas.css";

// Define libraries array as a constant outside the component
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

// Google Maps loading options
const GOOGLE_MAPS_API_KEY = "AIzaSyB7DhVp59EEf0xjAJgnWxBKv6Um3zzFQ_E";

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
    // Load saved addresses from localStorage on component mount
    const savedAddresses = localStorage.getItem('selectedAddresses');
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });
  const [userLocation, setUserLocation] = useState(null);
  const [directionsResponse] = useState(null);
  const [routeStarted, setRouteStarted] = useState(() => {
    const savedRouteStarted = localStorage.getItem('routeStarted');
    return savedRouteStarted ? JSON.parse(savedRouteStarted) : false;
  });
  // Add usage tracking
  const [dailyGeocodeCount, setDailyGeocodeCount] = useState(0);
  const DAILY_GEOCODE_LIMIT = 200; // Free tier allows 300/day, we set lower for safety

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
        
        // Mark despensas as selected if they're in selectedAddresses
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

  // Reset daily counter at midnight
  useEffect(() => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const msToMidnight = night.getTime() - now.getTime();

    // Reset counter at midnight
    const timer = setTimeout(() => {
      setDailyGeocodeCount(0);
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);

  // Save routeStarted to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('routeStarted', JSON.stringify(routeStarted));
  }, [routeStarted]);

  // Save selected addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedAddresses', JSON.stringify(selectedAddresses));
  }, [selectedAddresses]);

  // Geocodifica la dirección para obtener las coordenadas
  const geocodeAddress = async (address) => {
    // Check daily limit
    if (dailyGeocodeCount >= DAILY_GEOCODE_LIMIT) {
      alert('Se alcanzó el límite diario de búsquedas de direcciones. Por favor, intente mañana.');
      return null;
    }

    // Format the address with more structure
    const fullAddress = `${address}, Chihuahua, CHIH, Mexico`;

    try {
      // First try with full address
      let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=AIzaSyB7DhVp59EEf0xjAJgnWxBKv6Um3zzFQ_E`;

      let response = await axios.get(geocodeUrl);
      setDailyGeocodeCount(prev => prev + 1);

      if (response.data.status === "ZERO_RESULTS") {
        // If full address fails, try with just street and city
        const simpleAddress = `${address}, Chihuahua`;
        
        geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          simpleAddress
        )}&key=AIzaSyB7DhVp59EEf0xjAJgnWxBKv6Um3zzFQ_E`;
        
        response = await axios.get(geocodeUrl);
        setDailyGeocodeCount(prev => prev + 1);
      }

      if (response.data.status === "OVER_QUERY_LIMIT") {
        alert('Se alcanzó el límite de búsquedas de Google Maps. Por favor, intente más tarde.');
        return null;
      }

      if (response.data.status === "OK") {
        const result = response.data.results[0];
        // Check if the result is in Chihuahua
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
          if (!despensa.coordinates) {
            // Format the address more carefully
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
    setSelectedAddresses(
      updatedDespensas.filter((despensa) => despensa.selected)
    );
  };

  // Function to handle delivery status update
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

      // Update local states
      // 1. Remove from selectedAddresses
      setSelectedAddresses(prev => prev.filter(addr => addr.id_despensa !== id_despensa));
      
      // 2. Update despensas list
      setDespensas(prev => prev.filter(desp => desp.id_despensa !== id_despensa));

      // 3. If no more addresses are selected, reset routeStarted
      const remainingAddresses = selectedAddresses.filter(addr => addr.id_despensa !== id_despensa);
      if (remainingAddresses.length === 0) {
        setRouteStarted(false);
        localStorage.setItem('routeStarted', 'false');
      }

      // 4. Refresh the despensas list if marked as not delivered
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
      // Create a copy of selectedAddresses to update
      const updatedAddresses = [...selectedAddresses];

      // Update the ruta to 1 (in progress) for each selected despensa
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

        // Update the address in our local state
        const index = updatedAddresses.findIndex(addr => addr.id_despensa === address.id_despensa);
        if (index !== -1) {
          updatedAddresses[index] = { ...updatedAddresses[index], ruta: 1 };
        }
      }

      // Update selectedAddresses with the new route status
      setSelectedAddresses(updatedAddresses);

      // Open the route in Google Maps
      const waypoints = selectedAddresses
        .map(
          ({ calle, numero, colonia }) =>
            `${calle} ${numero}, ${colonia}, Chihuahua`
        )
        .map(encodeURIComponent)
        .join("|");
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${userLocation.lat},${userLocation.lng}&waypoints=${waypoints}`;
      window.open(mapsUrl, "_blank");
      
      // Set route as started to show delivery buttons
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
