import React, { useState } from "react";
import "./ValesSalida.css"; // Asegúrate de que esta ruta sea correcta

function Vales() {
  const [formData, setFormData] = useState({
    Fecha: "",
    Solicitante: "",
    Dependencia: "",
    Despensas: "",
    MochilaPrimaria: "",
    MochilasSecundaria: "",
    MochilasPreparatoria: "",
    Colchonetas: "",
    Aguas: "",
    Pintura: "",
    Impermeabilizante: "",
    Bicicletas: "",
    Mesas: "",
    Sillas: "",
    Dulces: "",
    Pinatas: "",
    Juguetes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSalidaSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:3001/entradavales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Asegúrate de enviar datos JSON
        },
        body: JSON.stringify(formData), // Enviando el formulario como JSON
      });
  
      if (response.ok) {
        console.log("Registro exitoso");
        alert("El vale de salida se generó correctamente.");
        resetForm();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error en el registro.");
      }
    } catch (error) {
      setErrorMessage("Error al conectar con el servidor: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const resetForm = () => {
    setFormData({
      Fecha: "",
      Solicitante: "",
      Dependencia: "",
      Despensas: "",
      MochilaPrimaria: "",
      MochilasSecundaria: "",
      MochilasPreparatoria: "",
      Colchonetas: "",
      Aguas: "",
      Pintura: "",
      Impermeabilizante: "",
      Bicicletas: "",
      Mesas: "",
      Sillas: "",
      Dulces: "",
      Pinatas: "",
      Juguetes: "",
    });
  };

  return (
    <div className="vale-container">
      <h1 className="vale-title">Vale de Entrada</h1>
      <form onSubmit={handleSalidaSubmit}>
        <div className="vale-form-group">
          <label htmlFor="fecha-salida">Fecha:</label>
          <input
            type="date"
            id="fecha-salida"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="vale-form-group">
          <label>Articulos</label>
          <div className="vale-number-group">
            <div className="vale-column">
              <label className="vale-number-label">
                Despensas
                <input
                  type="number"
                  name="Despensas"
                  value={formData.Despensas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Mochilas Primaria
                <input
                  type="number"
                  name="MochilaPrimaria"
                  value={formData.MochilaPrimaria}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Mochilas Secundaria
                <input
                  type="number"
                  name="MochilasSecundaria"
                  value={formData.MochilasSecundaria}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Mochilas Preparatoria
                <input
                  type="number"
                  name="MochilasPreparatoria"
                  value={formData.MochilasPreparatoria}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Colchonetas
                <input
                  type="number"
                  name="Colchonetas"
                  value={formData.Colchonetas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Aguas
                <input
                  type="number"
                  name="Aguas"
                  value={formData.Aguas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Pintura
                <input
                  type="number"
                  name="Pintura"
                  value={formData.Pintura}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className="vale-column">
              <label className="vale-number-label">
                Impermeabilizante
                <input
                  type="number"
                  name="Impermeabilizante"
                  value={formData.Impermeabilizante}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Bicicletas
                <input
                  type="number"
                  name="Bicicletas"
                  value={formData.Bicicletas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Mesas
                <input
                  type="number"
                  name="Mesas"
                  value={formData.Mesas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Sillas
                <input
                  type="number"
                  name="Sillas"
                  value={formData.Sillas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Dulces
                <input
                  type="number"
                  name="Dulces"
                  value={formData.Dulces}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Piñatas
                <input
                  type="number"
                  name="Pinatas"
                  value={formData.Pinatas}
                  onChange={handleChange}
                />
              </label>
              <label className="vale-number-label">
                Juguetes
                <input
                  type="number"
                  name="Juguetes"
                  value={formData.Juguetes}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar Vale de Entrada"}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default Vales;
