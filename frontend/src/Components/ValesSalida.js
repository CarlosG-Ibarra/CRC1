import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./ValesSalida.css"; // Asegúrate de que esta ruta sea correcta

function Vales() {
  const signatureRefEntrega = useRef(null);
  const signatureRefRecibe = useRef(null);

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

    if (signatureRefEntrega.current.isEmpty()) {
      setErrorMessage("La firma de quien entrega es obligatoria.");
      return;
    }

    if (signatureRefRecibe.current.isEmpty()) {
      setErrorMessage("La firma de quien recibe es obligatoria.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    // Convertir las firmas a archivos
    const signatureFileEntrega = signatureRefEntrega.current.toDataURL("image/png");
    const signatureFileRecibe = signatureRefRecibe.current.toDataURL("image/png");

    // Crear un archivo Blob a partir del Base64
    const blobEntrega = dataURLToBlob(signatureFileEntrega);
    const blobRecibe = dataURLToBlob(signatureFileRecibe);

    // Crear el FormData
    const formDataToSend = new FormData();
    formDataToSend.append('Fecha', formData.Fecha);
    formDataToSend.append('Solicitante', formData.Solicitante);
    formDataToSend.append('Dependencia', formData.Dependencia);
    formDataToSend.append('Despensas', formData.Despensas);
    formDataToSend.append('MochilaPrimaria', formData.MochilaPrimaria);
    formDataToSend.append('MochilasSecundaria', formData.MochilasSecundaria);
    formDataToSend.append('MochilasPreparatoria', formData.MochilasPreparatoria);
    formDataToSend.append('Colchonetas', formData.Colchonetas);
    formDataToSend.append('Aguas', formData.Aguas);
    formDataToSend.append('Pintura', formData.Pintura);
    formDataToSend.append('Impermeabilizante', formData.Impermeabilizante);
    formDataToSend.append('Bicicletas', formData.Bicicletas);
    formDataToSend.append('Mesas', formData.Mesas);
    formDataToSend.append('Sillas', formData.Sillas);
    formDataToSend.append('Dulces', formData.Dulces);
    formDataToSend.append('Pinatas', formData.Pinatas);
    formDataToSend.append('Juguetes', formData.Juguetes);
    formDataToSend.append('Firma1', blobEntrega, 'firma1.png');
    formDataToSend.append('Firma2', blobRecibe, 'firma2.png');

    try {
      const response = await fetch("http://localhost:3001/registro_vales", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        console.log("Registro exitoso");
        alert("El vale de salida se generó correctamente.");
        // Limpiar formulario y firmas
        resetForm();
        signatureRefEntrega.current.clear();
        signatureRefRecibe.current.clear();
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

  // Función para convertir Base64 a Blob
  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
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

  const clearSignatureEntrega = () => {
    signatureRefEntrega.current.clear();
  };

  const clearSignatureRecibe = () => {
    signatureRefRecibe.current.clear();
  };

  return (
    <div className="vale-container">
      <h1 className="vale-title">Vale de Salida</h1>
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
          <label htmlFor="dependencia-solicitante">Solicitante:</label>
          <input
            type="text"
            id="dependencia-solicitante"
            name="Solicitante"
            value={formData.Solicitante}
            onChange={handleChange}
            placeholder="Solicitante"
            required
          />
        </div>

        <div className="vale-form-group">
          <label htmlFor="dependencia-salida">Dependencia:</label>
          <input
            type="text"
            id="dependencia-salida"
            name="Dependencia"
            value={formData.Dependencia}
            onChange={handleChange}
            placeholder="Ingrese la dependencia"
            required
          />
        </div>

        <div className="vale-form-group">
          <label>Selecciona los artículos:</label>
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
            <h3>Firma de quien entrega</h3>
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
            <h3>Firma de quien recibe</h3>
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
          {loading ? "Generando..." : "Generar Vale de Salida"}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default Vales;
