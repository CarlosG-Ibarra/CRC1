import React, { useState, useRef } from "react";
import "./ValesSalida.css"; // Asegúrate de que esta ruta sea correcta
import SignatureCanvas from "react-signature-canvas";

function EntradaVales() {
  const [formData, setFormData] = useState({
    Fecha: "",
    Solicitante: "",
    Recipiente: "",
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
  const signatureRefEntrega = useRef(null);
  const signatureRefRecibe = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEntradaSubmit = async (e) => {
    e.preventDefault();

    if (signatureRefEntrega.current.isEmpty()) {
      setErrorMessage("La firma de quien entrega es obligatoria.");
      return;
    }

    if (signatureRefRecibe.current.isEmpty()) {
      setErrorMessage("La firma de quien recibe es obligatoria.");
      return;
    }

    if (!formData.Solicitante.trim()) {
      setErrorMessage("El nombre de quien entrega es obligatorio.");
      return;
    }

    if (!formData.Recipiente.trim()) {
      setErrorMessage("El nombre de quien recibe es obligatorio.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // Get the signature data
      const Firma1 = signatureRefEntrega.current.toDataURL();
      const Firma2 = signatureRefRecibe.current.toDataURL();

      const requestData = {
        ...formData,
        tipo: "entrada",  // Changed to lowercase to match ENUM value
        Firma1,
        Firma2
      };

      const response = await fetch("http://localhost:3001/registro_vales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Error en la solicitud de entrada de vales.");
      }

      if (response.ok) {
        alert("El vale de entrada se generó correctamente.");
        resetForm();
        signatureRefEntrega.current.clear();
        signatureRefRecibe.current.clear();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error en el registro.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Fecha: "",
      Solicitante: "",
      Recipiente: "",
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

  const clearSignatureEntrega = () => {
    signatureRefEntrega.current.clear();
  };

  const clearSignatureRecibe = () => {
    signatureRefRecibe.current.clear();
  };

  return (
    <div className="vale-container">
      <h1 className="vale-title">Vale de Entrada</h1>
      <form onSubmit={handleEntradaSubmit}>
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
          <label htmlFor="solicitante">Nombre de quien entrega:</label>
          <input
            type="text"
            id="solicitante"
            name="Solicitante"
            value={formData.Solicitante}
            onChange={handleChange}
            required
          />
        </div>

        <div className="vale-form-group">
          <label htmlFor="recipiente">Nombre de quien recibe:</label>
          <input
            type="text"
            id="recipiente"
            name="Recipiente"
            value={formData.Recipiente}
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

        <div className="vale-signatures-container">
          <div className="vale-signature-group">
            <h3>Firma de quien entrega ({formData.Solicitante || 'Pendiente'})</h3>
            <SignatureCanvas
              ref={signatureRefEntrega}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas",
              }}
            />
            <button type="button" onClick={clearSignatureEntrega}>
              Limpiar Firma
            </button>
          </div>

          <div className="vale-signature-group">
            <h3>Firma de quien recibe ({formData.Recipiente || 'Pendiente'})</h3>
            <SignatureCanvas
              ref={signatureRefRecibe}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas",
              }}
            />
            <button type="button" onClick={clearSignatureRecibe}>
              Limpiar Firma
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar Vale de Entrada"}
        </button>
        <button type="button" onClick={resetForm} className="reset-button">
          Limpiar
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
}

export default EntradaVales;
