import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./EntregarDespensas.css";

const EntregarDespensas = () => {
  const [formData, setFormData] = useState({
    nombreSolicitante: "",
    motivo: "",
    edad: "",
    sexo: "",
    genero: "",
    estadoCivil: "",
    escolaridad: "",
    ocupacion: "",
    fechaRegistro: "",
    colonia: "",
    calle: "",
    numero: "",
    cp: "",
    tel: "",
    zona: "",
    ruta: "0",

    // Family Integration
    nombre1: "",
    sexoIntegrante1: "",
    parentesco1: "",
    edadIntegrante1: "",
    estadoCivilIntegrante1: "",
    ocupacionIntegrante1: "",
    escolaridadIntegrante1: "",
    ingresoSol1: "",

    nombre2: "",
    sexoIntegrante2: "",
    parentesco2: "",
    edadIntegrante2: "",
    estadoCivilIntegrante2: "",
    ocupacionIntegrante2: "",
    escolaridadIntegrante2: "",
    ingresoSol2: "",

    nombre3: "",
    sexoIntegrante3: "",
    parentesco3: "",
    edadIntegrante3: "",
    estadoCivilIntegrante3: "",
    ocupacionIntegrante3: "",
    escolaridadIntegrante3: "",
    ingresoSol3: "",

    // Monthly Expenses
    ingreso_mensual: "",
    aportacion: "",
    luz: "",
    agua: "",
    telefono: "",
    creditos: "",
    gas: "",
    medicinas: "",
    transporte: "",
    television: "",
    renta: "",
    alimentacion: "",
    escuela: "",
    total: "",

    // Belongings
    vehiculo: "",
    situacionLegal: "",
    materialParedes: "",
    materialTecho: "",
    materialPiso: "",
    numCuartos: "",
    nivelSocioEconomico: "",

    // Miscellaneous
    firma: "",
    ine1: null,
    ine2: null,
    ine3: null,
    comentarios: "",
  });

  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1);
  };

  const [suggestions, setSuggestions] = useState([]); // Initialize as empty array
  const [debouncedName, setDebouncedName] = useState(""); // Debounced name input
  const [isLoading, setIsLoading] = useState(false); // To track loading state
  const [isNameFinalized, setIsNameFinalized] = useState(false); // Tracks if name input is finalized
  const debounceTimer = useRef(null); // Timer reference for debounce

  const signatureRef = useRef();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the form data with the new value
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Recalculate 'aportacion' if one of the ingresoSol values changed
      if (
        name === "ingresoSol1" ||
        name === "ingresoSol2" ||
        name === "ingresoSol3"
      ) {
        updatedData.aportacion =
          parseFloat(updatedData.ingresoSol1 || 0) +
          parseFloat(updatedData.ingresoSol2 || 0) +
          parseFloat(updatedData.ingresoSol3 || 0);
      }

      // Recalculate 'total' if any of the monthly expenses changed
      const totalExpense = [
        updatedData.ingreso_mensual,
        updatedData.aportacion,
        updatedData.luz,
        updatedData.agua,
        updatedData.telefono,
        updatedData.creditos,
        updatedData.gas,
        updatedData.medicinas,
        updatedData.transporte,
        updatedData.television,
        updatedData.renta,
        updatedData.alimentacion,
        updatedData.escuela,
        updatedData.internet,
      ].reduce((acc, field) => acc + parseFloat(field || 0), 0);

      updatedData.total = totalExpense;

      return updatedData;
    });
  };

  const handleNameChange = (event) => {
    const name = event.target.value;

    setIsNameFinalized(false);
    clearTimeout(debounceTimer.current);

    setFormData((prevData) => ({
      ...prevData,
      nombreSolicitante: name,
    }));

    debounceTimer.current = setTimeout(() => {
      setDebouncedName(name);
    }, 200);
  };

  useEffect(() => {
    if (debouncedName.length > 2 && !isNameFinalized) {
      setIsLoading(true);
      

      fetch(`http://localhost:3001/api/check-delivery?nombre=${debouncedName}`)
        .then((response) => response.json())
        .then((data) => {
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
      nombreSolicitante: suggestion.nombre_solicitante,
      motivo: suggestion.motivo,
      edad: suggestion.edad,
      colonia: suggestion.colonia,
      calle: suggestion.calle,
      numero: suggestion.numero,
      tel: suggestion.tel,
      zona: suggestion.zona,
      cp: suggestion.cp,
      sexo: suggestion.sexo,
      genero: suggestion.genero,
      escolaridad: suggestion.escolaridad,
      ocupacion: suggestion.ocupacion,
      estadoCivil: suggestion.estado_civil,

      // Add family data autofill here
      nombre1: suggestion.nombre_1,
      sexoIntegrante1: suggestion.sexo_integrante_1,
      parentesco1: suggestion.parentesco_1,
      edadIntegrante1: suggestion.edad_integrante_1,
      estadoCivilIntegrante1: suggestion.estado_civil_integrante_1,
      ocupacionIntegrante1: suggestion.ocupacion_integrante_1,
      escolaridadIntegrante1: suggestion.escolaridad_integrante_1,
      ingresoSol1: suggestion.ingreso_sol1,

      nombre2: suggestion.nombre_2,
      sexoIntegrante2: suggestion.sexo_integrante_2,
      parentesco2: suggestion.parentesco_2,
      edadIntegrante2: suggestion.edad_integrante_2,
      estadoCivilIntegrante2: suggestion.estado_civil_integrante_2,
      ocupacionIntegrante2: suggestion.ocupacion_integrante_2,
      escolaridadIntegrante2: suggestion.escolaridad_integrante_2,
      ingresoSol2: suggestion.ingreso_sol2,

      nombre3: suggestion.nombre_3,
      sexoIntegrante3: suggestion.sexo_integrante_3,
      parentesco3: suggestion.parentesco_3,
      edadIntegrante3: suggestion.edad_integrante_3,
      estadoCivilIntegrante3: suggestion.estado_civil_integrante_3,
      ocupacionIntegrante3: suggestion.ocupacion_integrante_3,
      escolaridadIntegrante3: suggestion.escolaridad_integrante_3,
      ingresoSol3: suggestion.ingreso_sol3,

      // Add monthly expenses data autofill here
      ingreso_mensual: suggestion.ingreso_mensual,
      aportacion: suggestion.aportacion,
      luz: suggestion.luz,
      agua: suggestion.agua,
      telefono: suggestion.telefono,
      creditos: suggestion.creditos,
      gas: suggestion.gas,
      medicinas: suggestion.medicinas,
      transporte: suggestion.transporte,
      television: suggestion.television,
      renta: suggestion.renta,
      alimentacion: suggestion.alimentacion,
      escuela: suggestion.escuela,
      internet: suggestion.internet,
      total: suggestion.total,

      vehiculo: suggestion.vehiculo,
      situacionLegal: suggestion.situacionLegal,
      materialParedes: suggestion.materialParedes,
      materialTecho: suggestion.materialTecho,
      materialPiso: suggestion.materialPiso,
      numCuartos: suggestion.numCuartos,
      nivelSocioEconomico: suggestion.nivelSocioEconomico,
    }));
    // Mark the name as finalized
    setIsNameFinalized(true);
    setSuggestions([]); // Clear suggestions after selection
  };

  // Function to clear the signature canvas
  const clearSignature = () => {
    signatureRef.current.clear(); // This will clear the signature
  };

  const handleFileUploads = async () => {
    try {
      const fileNames = {
        ine1: null,
        ine2: null,
        ine3: null,
        firma: null,
      };

      // Handle INE files
      if (formData.ine1)
        fileNames.ine1 = `${formData.nombreSolicitante}-ine1.${getFileExtension(
          formData.ine1.name
        )}`;
      if (formData.ine2)
        fileNames.ine2 = `${formData.nombreSolicitante}-ine2.${getFileExtension(
          formData.ine2.name
        )}`;
      if (formData.ine3)
        fileNames.ine3 = `${formData.nombreSolicitante}-ine3.${getFileExtension(
          formData.ine3.name
        )}`;

      // Handle signature
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        fileNames.firma = `${formData.nombreSolicitante}-firma.png`;
      }

      // Create FormData here, before using it
      const formDataToSend = new FormData();
      formDataToSend.append("nombreSolicitante", formData.nombreSolicitante);
      if (formData.ine1)
        formDataToSend.append("ine1", formData.ine1, fileNames.ine1);
      if (formData.ine2)
        formDataToSend.append("ine2", formData.ine2, fileNames.ine2);
      if (formData.ine3)
        formDataToSend.append("ine3", formData.ine3, fileNames.ine3);

      // Handle signature
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const signatureDataUrl = signatureRef.current.toDataURL("image/png");
        const blob = await (await fetch(signatureDataUrl)).blob();
        const file = new File([blob], fileNames.firma, { type: "image/png" });
        formDataToSend.append("firma", file);
      }

      // Upload files
      const response = await fetch("http://localhost:3001/api/upload-files", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("File upload failed");

      return fileNames;
    } catch (error) {
      console.error("Error during file upload:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // First upload files and get the filenames
      const fileNames = await handleFileUploads();

      // Prepare the data object to submit
      const dataToSubmit = {
        // Personal details
        nombre_solicitante: formData.nombreSolicitante,
        calle: formData.calle,
        numero: formData.numero,
        colonia: formData.colonia,
        cp: formData.cp,
        tel: formData.tel,
        zona: formData.zona,
        ruta: formData.ruta || 0,

        // Study details
        motivo: formData.motivo,
        edad: formData.edad,
        sexo: formData.sexo,
        genero: formData.genero,
        estado_civil: formData.estadoCivil,
        escolaridad: formData.escolaridad,
        ocupacion: formData.ocupacion,
        fecha_registro: formData.fechaRegistro,

        // Family details
        nombre_1: formData.nombre1,
        sexo_integrante_1: formData.sexoIntegrante1,
        parentesco_1: formData.parentesco1,
        edad_integrante_1: formData.edadIntegrante1,
        estado_civil_integrante_1: formData.estadoCivilIntegrante1,
        ocupacion_integrante_1: formData.ocupacionIntegrante1,
        escolaridad_integrante_1: formData.escolaridadIntegrante1,
        ingreso_sol1: formData.ingresoSol1,

        nombre_2: formData.nombre2,
        sexo_integrante_2: formData.sexoIntegrante2,
        parentesco_2: formData.parentesco2,
        edad_integrante_2: formData.edadIntegrante2,
        estado_civil_integrante_2: formData.estadoCivilIntegrante2,
        ocupacion_integrante_2: formData.ocupacionIntegrante2,
        escolaridad_integrante_2: formData.escolaridadIntegrante2,
        ingreso_sol2: formData.ingresoSol2,

        nombre_3: formData.nombre3,
        sexo_integrante_3: formData.sexoIntegrante3,
        parentesco_3: formData.parentesco3,
        edad_integrante_3: formData.edadIntegrante3,
        estado_civil_integrante_3: formData.estadoCivilIntegrante3,
        ocupacion_integrante_3: formData.ocupacionIntegrante3,
        escolaridad_integrante_3: formData.escolaridadIntegrante3,
        ingreso_sol3: formData.ingresoSol3,

        // Monthly expenses
        ingreso_mensual: formData.ingreso_mensual,
        aportacion: formData.aportacion,
        luz: formData.luz,
        agua: formData.agua,
        telefono: formData.telefono,
        creditos: formData.creditos,
        gas: formData.gas,
        medicinas: formData.medicinas,
        transporte: formData.transporte,
        television: formData.television,
        renta: formData.renta,
        alimentacion: formData.alimentacion,
        escuela: formData.escuela,
        internet: formData.internet,
        total: formData.total,

        // Belongings and other data
        vehiculo: formData.vehiculo,
        situacionLegal: formData.situacionLegal,
        materialParedes: formData.materialParedes,
        materialTecho: formData.materialTecho,
        materialPiso: formData.materialPiso,
        numCuartos: formData.numCuartos,
        nivelSocioEconomico: formData.nivelSocioEconomico,

        // Files and comments
        firma: fileNames.firma,
        ine1: fileNames.ine1,
        ine2: fileNames.ine2,
        ine3: fileNames.ine3,
        comentarios: formData.comentarios,
      };

      console.log("Data to submit:", dataToSubmit);

      // Submit the form data
      const response = await fetch(
        "http://localhost:3001/api/estudio-socioeconomico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al enviar el formulario");
      }

      const data = await response.json();
      console.log("Success:", data);
      alert("¡Formulario de Estudio Socioeconómico enviado correctamente!");
      // Reset form after successful submission
      setFormData({
        // Personal details
        nombreSolicitante: "",
        calle: "",
        numero: "",
        colonia: "",
        cp: "",
        tel: "",
        zona: "",
        ruta: "",

        // Study details
        motivo: "",
        edad: "",
        sexo: "",
        genero: "",
        estadoCivil: "",
        escolaridad: "",
        ocupacion: "",
        fechaRegistro: "",

        // Family details
        nombre1: "",
        sexoIntegrante1: "",
        parentesco1: "",
        edadIntegrante1: "",
        estadoCivilIntegrante1: "",
        ocupacionIntegrante1: "",
        escolaridadIntegrante1: "",
        ingresoSol1: "",

        nombre2: "",
        sexoIntegrante2: "",
        parentesco2: "",
        edadIntegrante2: "",
        estadoCivilIntegrante2: "",
        ocupacionIntegrante2: "",
        escolaridadIntegrante2: "",
        ingresoSol2: "",

        nombre3: "",
        sexoIntegrante3: "",
        parentesco3: "",
        edadIntegrante3: "",
        estadoCivilIntegrante3: "",
        ocupacionIntegrante3: "",
        escolaridadIntegrante3: "",
        ingresoSol3: "",

        // Monthly expenses
        ingreso_mensual: "",
        aportacion: "",
        luz: "",
        agua: "",
        telefono: "",
        creditos: "",
        gas: "",
        medicinas: "",
        transporte: "",
        television: "",
        renta: "",
        alimentacion: "",
        escuela: "",
        internet: "",
        total: "",

        // Belongings and other data
        vehiculo: "",
        situacionLegal: "",
        materialParedes: "",
        materialTecho: "",
        materialPiso: "",
        numCuartos: "",
        nivelSocioEconomico: "",

        // Files and comments
        firma: "",
        ine1: null,
        ine2: null,
        ine3: null,
        comentarios: "",
      });

      // Also clear the signature
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el formulario. Por favor, intente nuevamente.");
    }
  };

  return (
    <div className="entregar-despensas-container">
      <h1>Formulario de Estudio Socioeconómico</h1>
      <form>
        <section className="entregar-despensas-section estudio-socioeconomico">
          <h2>Estudio Socioeconómico</h2>

          <div className="horizontal-group">
            {/* Row 1 */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="nombreSolicitante">
                  Nombre del solicitante:
                </label>
                <input
                  type="text"
                  id="nombreSolicitante"
                  name="nombreSolicitante"
                  value={formData.nombreSolicitante}
                  onChange={handleNameChange}
                  placeholder="Escribe el nombre"
                />

                {/* Suggestions Box */}
                {Array.isArray(suggestions) && suggestions.length > 0 && (
                  <div className="suggestions-box">
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : suggestions.length === 0 ? (
                      <p>No results found</p>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            setFormData((prevData) => ({
                              ...prevData,
                              nombreSolicitante: suggestion.nombre_solicitante,
                            }));
                            handleSuggestionSelect(suggestion);
                          }}
                        >
                          {suggestion.nombre_solicitante}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="motivo">Motivo del estudio</label>
                <input
                  type="text"
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange} // Allow updates for existing and new users
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="fechaRegistro">Fecha del estudio</label>
                <input
                  type="date"
                  id="fechaRegistro"
                  name="fechaRegistro"
                  value={formData.fechaRegistro}
                  onChange={handleChange} // This is unique for each "entrega"
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="calle">Calle</label>
                <input
                  type="text"
                  id="calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="numero">Número</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="colonia">Colonia</label>
                <input
                  type="text"
                  id="colonia"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="cp">Código postal</label>
                <input
                  type="text"
                  id="cp"
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange} // Allow updates
                />
              </div>
            </div>

            {/* Contact Info and Zone */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="tel">Teléfono</label>
                <input
                  type="tel"
                  id="tel"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="zona">Zona</label>
                <input
                  type="text"
                  id="zona"
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange} // Allow updates
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="edad">Edad</label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="escolaridad">Escolaridad</label>
                <input
                  type="text"
                  id="escolaridad"
                  name="escolaridad"
                  value={formData.escolaridad}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ocupacion">Ocupación</label>
                <input
                  type="text"
                  id="ocupacion"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange} // Allow updates
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="estadoCivil">Estado civil</label>
                <input
                  type="text"
                  id="estadoCivil"
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleChange} // Allow updates
                />
              </div>
            </div>

            {/* Gender Info */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange} // Allow updates
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="genero">Género</label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange} // Allow updates
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option value="Mujer Cisgénero">Mujer Cisgénero</option>
                  <option value="Hombre Cisgénero">Hombre Cisgénero</option>
                  <option value="Mujer Transgénero">Mujer Transgénero</option>
                  <option value="Hombre Transgénero">Hombre Transgénero</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="entregar-despensas-section datos-integracion-familiar">
          <h2>Datos de la integración familiar</h2>

          {/* Family Member 1 */}
          <div className="persona-container">
            <h3>Integrante 1</h3>
            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="nombre1">Nombre</label>
                <input
                  type="text"
                  id="nombre1"
                  name="nombre1"
                  value={formData.nombre1}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="edadIntegrante1">Edad</label>
                <input
                  type="number"
                  id="edadIntegrante1"
                  name="edadIntegrante1"
                  value={formData.edadIntegrante1}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="parentesco1">Parentesco</label>
                <input
                  type="text"
                  id="parentesco1"
                  name="parentesco1"
                  value={formData.parentesco1}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ocupacionIntegrante1">Ocupación</label>
                <input
                  type="text"
                  id="ocupacionIntegrante1"
                  name="ocupacionIntegrante1"
                  value={formData.ocupacionIntegrante1}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>
            </div>

            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="escolaridadIntegrante1">Escolaridad</label>
                <input
                  type="text"
                  id="escolaridadIntegrante1"
                  name="escolaridadIntegrante1"
                  value={formData.escolaridadIntegrante1}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="estadoCivilIntegrante1">Estado Civil</label>
                <input
                  type="text"
                  id="estadoCivilIntegrante1"
                  name="estadoCivilIntegrante1"
                  value={formData.estadoCivilIntegrante1}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ingresoSol1">Ingresos</label>
                <input
                  type="number"
                  id="ingresoSol1"
                  name="ingresoSol1"
                  value={formData.ingresoSol1}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="sexoIntegrante1">Sexo</label>
                <select
                  id="sexoIntegrante1"
                  name="sexoIntegrante1"
                  value={formData.sexoIntegrante1}
                  onChange={handleChange} // Updated to handleChange
                >
                  <option value="">Seleccione</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family Member 2 */}
          <div className="persona-container">
            <h3>Integrante 2</h3>
            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="nombre2">Nombre</label>
                <input
                  type="text"
                  id="nombre2"
                  name="nombre2"
                  value={formData.nombre2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="edadIntegrante2">Edad</label>
                <input
                  type="number"
                  id="edadIntegrante2"
                  name="edadIntegrante2"
                  value={formData.edadIntegrante2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="parentesco2">Parentesco</label>
                <input
                  type="text"
                  id="parentesco2"
                  name="parentesco2"
                  value={formData.parentesco2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ocupacionIntegrante2">Ocupación</label>
                <input
                  type="text"
                  id="ocupacionIntegrante2"
                  name="ocupacionIntegrante2"
                  value={formData.ocupacionIntegrante2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>
            </div>

            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="escolaridadIntegrante2">Escolaridad</label>
                <input
                  type="text"
                  id="escolaridadIntegrante2"
                  name="escolaridadIntegrante2"
                  value={formData.escolaridadIntegrante2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="estadoCivilIntegrante2">Estado Civil</label>
                <input
                  type="text"
                  id="estadoCivilIntegrante2"
                  name="estadoCivilIntegrante2"
                  value={formData.estadoCivilIntegrante2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ingresoSol2">Ingresos</label>
                <input
                  type="number"
                  id="ingresoSol2"
                  name="ingresoSol2"
                  value={formData.ingresoSol2}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="sexoIntegrante2">Sexo</label>
                <select
                  id="sexoIntegrante2"
                  name="sexoIntegrante2"
                  value={formData.sexoIntegrante2}
                  onChange={handleChange} // Updated to handleChange
                >
                  <option value="">Seleccione</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family Member 3 */}
          <div className="persona-container">
            <h3>Integrante 3</h3>
            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="nombre3">Nombre</label>
                <input
                  type="text"
                  id="nombre3"
                  name="nombre3"
                  value={formData.nombre3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="edadIntegrante3">Edad</label>
                <input
                  type="number"
                  id="edadIntegrante3"
                  name="edadIntegrante3"
                  value={formData.edadIntegrante3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="parentesco3">Parentesco</label>
                <input
                  type="text"
                  id="parentesco3"
                  name="parentesco3"
                  value={formData.parentesco3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ocupacionIntegrante3">Ocupación</label>
                <input
                  type="text"
                  id="ocupacionIntegrante3"
                  name="ocupacionIntegrante3"
                  value={formData.ocupacionIntegrante3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>
            </div>

            <div className="horizontal-group">
              <div className="entregar-despensas-group">
                <label htmlFor="escolaridadIntegrante3">Escolaridad</label>
                <input
                  type="text"
                  id="escolaridadIntegrante3"
                  name="escolaridadIntegrante3"
                  value={formData.escolaridadIntegrante3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="estadoCivilIntegrante3">Estado Civil</label>
                <input
                  type="text"
                  id="estadoCivilIntegrante3"
                  name="estadoCivilIntegrante3"
                  value={formData.estadoCivilIntegrante3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ingresoSol3">Ingresos</label>
                <input
                  type="number"
                  id="ingresoSol3"
                  name="ingresoSol3"
                  value={formData.ingresoSol3}
                  onChange={handleChange} // Updated to handleChange
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="sexoIntegrante3">Sexo</label>
                <select
                  id="sexoIntegrante3"
                  name="sexoIntegrante3"
                  value={formData.sexoIntegrante3}
                  onChange={handleChange} // Updated to handleChange
                >
                  <option value="">Seleccione</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="entregar-despensas-section gastos-mensuales">
          <h2>Gastos Mensuales</h2>

          {/* Ingreso Mensual */}
          <div className="horizontal-group">
            <div className="entregar-despensas-group">
              <label htmlFor="ingreso_mensual">Ingreso Mensual</label>
              <input
                type="number"
                step="0.01"
                id="ingreso_mensual"
                name="ingreso_mensual"
                value={formData.ingreso_mensual}
                onChange={handleChange} // Updated to handleChange
                placeholder="Ingrese el ingreso mensual"
              />
            </div>

            {/* Aportación */}
            <div className="entregar-despensas-group">
              <label htmlFor="aportacion">Aportación</label>
              <input
                type="number"
                step="0.01"
                id="aportacion"
                name="aportacion"
                value={formData.aportacion}
                onChange={handleChange} // Updated to handleChange
                placeholder="Ingrese la aportación"
              />
            </div>
          </div>

          <div className="horizontal-group">
            {/* Luz */}
            <div className="entregar-despensas-group">
              <label htmlFor="luz">Gasto en Luz</label>
              <input
                type="number"
                step="0.01"
                id="luz"
                name="luz"
                value={formData.luz}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en luz"
              />
            </div>

            {/* Agua */}
            <div className="entregar-despensas-group">
              <label htmlFor="agua">Gasto en Agua</label>
              <input
                type="number"
                step="0.01"
                id="agua"
                name="agua"
                value={formData.agua}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en agua"
              />
            </div>

            {/* Teléfono */}
            <div className="entregar-despensas-group">
              <label htmlFor="telefono">Gasto en Teléfono</label>
              <input
                type="number"
                step="0.01"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en teléfono"
              />
            </div>
          </div>

          <div className="horizontal-group">
            {/* Créditos */}
            <div className="entregar-despensas-group">
              <label htmlFor="creditos">Gasto en Créditos</label>
              <input
                type="number"
                step="0.01"
                id="creditos"
                name="creditos"
                value={formData.creditos}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en créditos"
              />
            </div>

            {/* Gas */}
            <div className="entregar-despensas-group">
              <label htmlFor="gas">Gasto en Gas</label>
              <input
                type="number"
                step="0.01"
                id="gas"
                name="gas"
                value={formData.gas}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en gas"
              />
            </div>

            {/* Medicinas */}
            <div className="entregar-despensas-group">
              <label htmlFor="medicinas">Gasto en Medicinas</label>
              <input
                type="number"
                step="0.01"
                id="medicinas"
                name="medicinas"
                value={formData.medicinas}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en medicinas"
              />
            </div>
          </div>

          <div className="horizontal-group">
            {/* Transporte */}
            <div className="entregar-despensas-group">
              <label htmlFor="transporte">Gasto en Transporte</label>
              <input
                type="number"
                step="0.01"
                id="transporte"
                name="transporte"
                value={formData.transporte}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en transporte"
              />
            </div>

            {/* Televisión */}
            <div className="entregar-despensas-group">
              <label htmlFor="television">Gasto en Televisión</label>
              <input
                type="number"
                step="0.01"
                id="television"
                name="television"
                value={formData.television}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en televisión"
              />
            </div>

            {/* Renta */}
            <div className="entregar-despensas-group">
              <label htmlFor="renta">Gasto en Renta</label>
              <input
                type="number"
                step="0.01"
                id="renta"
                name="renta"
                value={formData.renta}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en renta"
              />
            </div>
          </div>

          <div className="horizontal-group">
            {/* Alimentación */}
            <div className="entregar-despensas-group">
              <label htmlFor="alimentacion">Gasto en Alimentación</label>
              <input
                type="number"
                step="0.01"
                id="alimentacion"
                name="alimentacion"
                value={formData.alimentacion}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en alimentación"
              />
            </div>

            {/* Escuela */}
            <div className="entregar-despensas-group">
              <label htmlFor="escuela">Gasto en Escuela</label>
              <input
                type="number"
                step="0.01"
                id="escuela"
                name="escuela"
                value={formData.escuela}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en escuela"
              />
            </div>

            {/* Internet */}
            <div className="entregar-despensas-group">
              <label htmlFor="internet">Gasto en Internet</label>
              <input
                type="number"
                step="0.01"
                id="internet"
                name="internet"
                value={formData.internet}
                onChange={handleChange} // Updated to handleChange
                placeholder="Gasto mensual en internet"
              />
            </div>
          </div>

          {/* Total Gastos */}
          <div className="horizontal-group">
            <div className="entregar-despensas-group">
              <label htmlFor="total">Total de Gastos Mensuales</label>
              <input
                type="number"
                step="0.01"
                id="total"
                name="total"
                value={formData.total}
                onChange={handleChange} // Updated to handleChange
                placeholder="Total de los gastos mensuales"
                disabled
              />
            </div>
          </div>
        </section>

        <section className="entregar-despensas-section apartado-pertenencias">
          <h2>Apartado de Pertenencias</h2>

          <div className="horizontal-group">
            {/* Row 1 */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="vehiculo">¿Posee vehículo?</label>
                <select
                  id="vehiculo"
                  name="vehiculo"
                  value={formData.vehiculo}
                  onChange={handleChange}
                >
                  <option value="">Seleccione</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="situacionLegal">
                  Situación legal de la vivienda
                </label>
                <select
                  id="situacionLegal"
                  name="situacionLegal"
                  value={formData.situacionLegal}
                  onChange={handleChange}
                >
                  <option value="">Seleccione</option>
                  <option value="propia">Propia</option>
                  <option value="pagandose">Pagándose</option>
                  <option value="rentada">Rentada</option>
                  <option value="prestada">Prestada</option>
                </select>
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="materialParedes">Material de paredes</label>
                <input
                  type="text"
                  id="materialParedes"
                  name="materialParedes"
                  value={formData.materialParedes}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="materialTecho">Material de techo</label>
                <input
                  type="text"
                  id="materialTecho"
                  name="materialTecho"
                  value={formData.materialTecho}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="materialPiso">Material de piso</label>
                <input
                  type="text"
                  id="materialPiso"
                  name="materialPiso"
                  value={formData.materialPiso}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="numCuartos">Número de cuartos</label>
                <input
                  type="number"
                  id="numCuartos"
                  name="numCuartos"
                  value={formData.numCuartos}
                  onChange={handleChange}
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="nivelSocioEconomico">
                  Nivel socioeconómico
                </label>
                <select
                  id="nivelSocioEconomico"
                  name="nivelSocioEconomico"
                  value={formData.nivelSocioEconomico}
                  onChange={handleChange}
                >
                  <option value="">Seleccione</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio-bajo">Medio-bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="ine1">INE Parte 1</label>
                <input
                  type="file"
                  id="ine1"
                  name="ine1"
                  accept="image/*" // Only allows image files
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      ine1: e.target.files[0], // Save the file object directly
                    }))
                  }
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ine2">INE Parte 2</label>
                <input
                  type="file"
                  id="ine2"
                  name="ine2"
                  accept="image/*" // Only allows image files
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      ine2: e.target.files[0], // Save the file object directly
                    }))
                  }
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="ine3">INE Parte 3</label>
                <input
                  type="file"
                  id="ine3"
                  name="ine3"
                  accept="image/*" // Only allows image files
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      ine3: e.target.files[0], // Save the file object directly
                    }))
                  }
                />
              </div>

              <div className="entregar-despensas-group">
                <label htmlFor="firma">Firma del solicitante</label>
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 200,
                    className: "signature-canvas",
                  }}
                />
                <button type="button" onClick={clearSignature}>
                  Limpiar Firma
                </button>
              </div>
            </div>

            {/* Row 4 */}
            <div className="horizontal-group-row">
              <div className="entregar-despensas-group">
                <label htmlFor="comentarios">Comentarios</label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="form-buttons">
          <button type="button" onClick={handleSubmit}>
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntregarDespensas;
