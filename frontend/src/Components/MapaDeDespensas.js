import React, { useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import axios from "axios";
import "./MapaDeDespensas.css";

const libraries = ["places"];
const LATITUDE_SEPARATION = 30.6353; // Define la latitud que separa Norte y Sur en Chihuahua

const MapaDeDespensas = () => {
  const [despensas, setDespensas] = useState([]);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [directionsResponse] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBjxs1RTJXl5_9iDICv7RfL_ICxuYabKzg", // Reemplazar clave API
    libraries,
  });

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
        console.log("Datos de despensas:", data);
        setDespensas(data.despensas);
      } catch (error) {
        console.error("Error al obtener despensas:", error);
      }
    };
    fetchDespensas();
  }, []);

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

  // Geocodifica la dirección para obtener las coordenadas
  const geocodeAddress = async (address) => {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=AIzaSyBh1DSb-jtJpiasgRBWnh1c16xnfujNdOw`;
    try {
      const response = await axios.get(geocodeUrl);
      if (response.data.status === "ZERO_RESULTS") {
        console.warn(
          `No se encontraron resultados para la dirección: ${address}`
        );
        alert(`No se encontraron resultados para la dirección: ${address}`);
        return null;
      }
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } catch (error) {
      console.error("Error geocodificando la dirección:", error);
      return null;
    }
  };

  // Maneja la selección de una despensa
  const handleSelectDespensa = async (despensaId) => {
    const updatedDespensas = await Promise.all(
      despensas.map(async (despensa) => {
        if (despensa.id_despensa === despensaId) {
          if (!despensa.coordinates) {
            const coords = await geocodeAddress(
              `${despensa.calle} ${despensa.numero}, ${despensa.colonia}`
            );
            return {
              ...despensa,
              selected: !despensa.selected,
              coordinates: coords,
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

  // Inicia la ruta en Google Maps con las direcciones seleccionadas
  const handleStartRoute = async () => {
    try {
      // Update the ruta in the database for each selected despensa
      for (const address of selectedAddresses) {
        const response = await fetch(
          "http://localhost:3001/despensa/actualizar-ruta",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_despensa: address.id_despensa }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la ruta");
        }
      }

      // Open the route in Google Maps with the selected addresses
      const waypoints = selectedAddresses
        .map(
          ({ calle, numero, colonia }) =>
            `${calle} ${numero}, ${colonia}, Chihuahua`
        )
        .map(encodeURIComponent)
        .join("|");
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${userLocation.lat},${userLocation.lng}&waypoints=${waypoints}`;
      window.open(mapsUrl, "_blank");
    } catch (error) {
      console.error("Error al iniciar la ruta:", error);
    }
  };

  // Limpia la selección de rutas
  const handleClearRoute = () => {
    setDespensas(
      despensas.map((despensa) => ({ ...despensa, selected: false }))
    );
    setSelectedAddresses([]);
  };

  if (loadError) return <div>Error al cargar Google Maps</div>;
  if (!isLoaded) return <div>Cargando...</div>;

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
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={userLocation || { lat: LATITUDE_SEPARATION, lng: -106.0 }}
          zoom={12}
        >
          {userLocation && <Marker position={userLocation} />}
          {despensas
            .filter((despensa) => despensa.selected && despensa.coordinates)
            .map((despensa) => (
              <Marker
                key={despensa.id_despensa}
                position={despensa.coordinates}
                label={despensa.colonia}
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
              onClick={() => handleSelectDespensa(address.id_despensa)}
              style={{ cursor: 'pointer' }}
            >
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
};

export default MapaDeDespensas;
