const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import fs for file operations
const app = express();
const bodyParser = require("body-parser");

// Configuración de la base de datos
const PORT = 3001;
const DB = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "despensas_crc",
  port: 3306,
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json()); // Add this line to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data


// Conexión a la base de datos
DB.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Conexión exitosa");
});
// Initialize Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes"); // Save files to the 'imagenes' directory
  },
  filename: (req, file, cb) => {
    // Ensure 'nombreSolicitante' is provided
    if (!req.body.nombreSolicitante) {
      return cb(new Error("Nombre del solicitante es requerido"), null);
    }

    // Generate a unique name for each file
    const uniqueName = `${req.body.nombreSolicitante}-${
      file.fieldname
    }${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Initialize Multer with Storage
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// File Upload Endpoint
app.post(
  "/api/upload-files",
  upload.fields([
    { name: "ine1", maxCount: 1 },
    { name: "ine2", maxCount: 1 },
    { name: "ine3", maxCount: 1 },
    { name: "firma", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      // Ensure at least one file is uploaded
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No files were uploaded." });
      }

      // Extract uploaded filenames
      const filenames = {
        ine1Name: req.files.ine1 ? req.files.ine1[0].filename : null,
        ine2Name: req.files.ine2 ? req.files.ine2[0].filename : null,
        ine3Name: req.files.ine3 ? req.files.ine3[0].filename : null,
        firmaName: req.files.firma ? req.files.firma[0].filename : null,
      };

      console.log("Uploaded Files:", filenames);
      res.json({ message: "Files uploaded successfully", filenames });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Error uploading files.", error });
    }
  }
);

// Error Handling Middleware for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    return res
      .status(400)
      .json({ message: "Multer error", error: err.message });
  } else if (err) {
    // Handle other errors
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
  next();
});

// Registro de despensas
app.post("/registro-despensas", (req, res) => {
  const { nombre, calle, numero, colonia, cp, telefono, zona } = req.body;

  // Check for required fields
  if (!nombre || !calle || !numero || !colonia || !cp || !telefono || !zona) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  // Insert into the estudio_socioeconomico table (despensa part only)
  const query = `
        INSERT INTO estudio_socioeconomico 
        (nombre_solicitante, calle, numero, colonia, cp, tel, zona)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [nombre, calle, numero, colonia, cp, telefono, zona];

  DB.query(query, values, (err, result) => {
    if (err) {
      console.error("Error al insertar datos:", err);
      return res.status(500).json({ message: "Error en el servidor." });
    }

    res
      .status(201)
      .json({ message: "Registro exitoso", id_despensa: result.insertId });
  });
});

// Endpoint to handle form submission
app.post("/api/estudio-socioeconomico", (req, res) => {
  const formData = req.body;

  // Log all received data
  console.log("Data received:", JSON.stringify(formData, null, 2));

  const requiredFields = [
    "nombre_solicitante", "calle", "numero", "colonia", "cp", "tel", "zona", "motivo",
    "edad", "sexo", "genero", "estado_civil", "escolaridad", "ocupacion", "fecha_registro",
    "nombre_1", "sexo_integrante_1", "parentesco_1", "edad_integrante_1", "estado_civil_integrante_1", "ocupacion_integrante_1", "escolaridad_integrante_1", "ingreso_sol1",
    "nombre_2", "sexo_integrante_2", "parentesco_2", "edad_integrante_2", "estado_civil_integrante_2", "ocupacion_integrante_2", "escolaridad_integrante_2", "ingreso_sol2",
    "nombre_3", "sexo_integrante_3", "parentesco_3", "edad_integrante_3", "estado_civil_integrante_3", "ocupacion_integrante_3", "escolaridad_integrante_3", "ingreso_sol3",
    "ingreso_mensual", "aportacion", "luz", "agua", "telefono", "creditos", "gas", "medicinas", "transporte", "television",
    "renta", "alimentacion", "escuela", "internet", "total",
    "vehiculo", "situacionLegal", "materialParedes", "materialTecho", "materialPiso", "numCuartos", "nivelSocioEconomico", "firma", "ine1", "ine2", "ine3", "comentarios"
  ];

  // Populate data, setting missing fields to null
  const data = {};
  for (const field of requiredFields) {
    data[field] = formData[field] || null; // Use `null` for missing values
  }

  // Generate SQL query
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data).map(value => (value !== null ? `'${value}'` : "NULL")).join(", ");
  const sql = `INSERT INTO estudio_socioeconomico (${columns}) VALUES (${values})`;

  // Log SQL query for debugging
  console.log("SQL Query:", sql);

  // Execute the SQL query
  DB.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Database error", details: err.message });
    }

    // If everything is fine, return success with result
    res.status(200).json({ message: "Data inserted successfully", result });
  });
});

// Obtener despensas con ruta = 0
app.get("/despensas/sin-ruta", (req, res) => {
  const query = `
    SELECT 
      id_despensa,
      nombre_solicitante,
      calle,
      numero,
      colonia,
      zona,
      ruta
    FROM estudio_socioeconomico 
    WHERE ruta = 0 OR ruta IS NULL
  `;
  
  DB.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las despensas:", err);
      return res.status(500).json({ 
        message: "Error al obtener despensas sin ruta", 
        error: err 
      });
    }
    res.json(results);
  });
});

// Actualizar la ruta de una despensa
app.post("/despensa/actualizar-ruta", (req, res) => {
  const { id_despensa, ruta } = req.body; // Get both the ID and the new route value
  
  const query = "UPDATE estudio_socioeconomico SET ruta = ? WHERE id_despensa = ?";
  
  DB.query(query, [ruta, id_despensa], (err, results) => {
    if (err) {
      console.error("Error al actualizar la despensa:", err);
      return res.status(500).json({ message: "Error en el servidor." });
    }
    res.status(200).json({ message: "Ruta actualizada correctamente." });
  });
});

//VALE DE SALIDA
app.post("/registro_vales", (req, res) => {
  const {
    Fecha,
    Solicitante,
    Dependencia,
    Despensas,
    MochilaPrimaria,
    MochilasSecundaria,
    MochilasPreparatoria,
    Colchonetas,
    Aguas,
    Pintura,
    Impermeabilizante,
    Bicicletas,
    Mesas,
    Sillas,
    Dulces,
    Piñatas,
    Juguetes,
    Firma1,
    Firma2,
  } = req.body;
  const SQL_QUERY =
    "INSERT INTO registro_vales (fecha_entrega, solicitante, dependencia, cantidad_despensas, cantidad_mochilas_primaria, cantidad_mochilas_secundaria, cantidad_mochilas_preparatoria, cantidad_colchonetas, cantidad_aguas, cantidad_botes_pintura,cantidad_botes_impermeabilizante, cantidad_bicicletas, cantidad_mesas, cantidad_sillas, cantidad_dulces, cantidad_piñatas,cantidad_juguetes, firma_entrega, firma_recibe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  DB.query(
    SQL_QUERY,
    [
      Fecha,
      Solicitante,
      Dependencia,
      Despensas,
      MochilaPrimaria,
      MochilasSecundaria,
      MochilasPreparatoria,
      Colchonetas,
      Aguas,
      Pintura,
      Impermeabilizante,
      Bicicletas,
      Mesas,
      Sillas,
      Dulces,
      Piñatas,
      Juguetes,
      Firma1,
      Firma2,
    ],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.json(result);
    }
  );
});

//Busqueda de vales
app.get("/registro_vales", (req, res) => {
  const { term } = req.query; // Obtener el término de búsqueda desde la consulta

  const SQL_QUERY = `
        SELECT * FROM registro_vales 
        WHERE LOWER(fecha_entrega) LIKE ? OR 
              LOWER(dependencia) LIKE ? OR 
              LOWER(solicitante) LIKE ?
    `;

  const searchTerm = `%${term.toLowerCase()}%`; // Preparar el término con comodines y en minúsculas

  // Realizar la consulta a la base de datos
  DB.query(SQL_QUERY, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error al buscar los vales:", err);
      return res.status(500).json({ error: "Error al buscar los vales" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No se encontraron resultados." });
    }

    res.status(200).json(results); // Enviar los resultados como respuesta
  });
});

// User registration route
app.post("/register", (req, res) => {
  const { nombre, email, pass, nivel } = req.body;

  // Basic input validation
  if (!nombre || !email || !pass || !nivel) {
    return res
      .status(400)
      .json({ error: "Todos los campos son obligatorios." });
  }

  const SQL_QUERY =
    "INSERT INTO usuarios (nombre, email, pass, nivel) VALUES (?, ?, ?, ?)";
  DB.query(SQL_QUERY, [nombre, email, pass, nivel], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al registrar el usuario.", details: err });
    }
    res
      .status(200)
      .json({ message: "Usuario registrado exitosamente", result });
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, pass } = req.body;
  console.log("Login attempt with:", { email, pass }); // Log input data

  // Check if user exists
  DB.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Database error:", err); // Log database error
        return res.status(500).send({ message: "Error en la base de datos" });
      }

      if (results.length === 0) {
        console.log("Usuario no encontrado:", email); // Log if user is not found
        return res.status(401).send({ message: "Usuario no encontrado" });
      }

      const user = results[0];

      // Compare plain text password
      if (user.pass !== pass) {
        console.log("Contraseña incorrecta para el usuario:", email); // Log if password is incorrect
        return res.status(401).send({ message: "Contraseña incorrecta" });
      }

      // Authentication success, include the 'nivel' field in the response
      res.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          nivel: user.nivel,
        },
      });
    }
  );
});

//nivel de usuario
app.get("/getUserNivel/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = "SELECT nivel FROM usuarios WHERE id_usuario = ?";
  DB.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching user nivel");
    }
    if (results.length > 0) {
      res.json({ nivel: results[0].nivel });
    } else {
      res.status(404).send("User not found");
    }
  });
});

// Fetch all users
app.get("/usuarios", (req, res) => {
  // Keep req here, even if not used
  const query = "SELECT * FROM usuarios";
  DB.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching users");
    }
    res.json(results); // Send the results as JSON
  });
});

// Delete a user by id
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM usuarios WHERE id_usuario = ?";
  DB.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting user");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  });
});

// Ruta para guardar el formulario y la firma
app.post("/api/submit-form", (req, res) => {
  const { nombreSolicitante, firmaFilename, signatureDataURL, ...otherData } =
    req.body;

  if (signatureDataURL) {
    // Remove the base64 URL prefix
    const base64Data = signatureDataURL.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, "firmas", firmaFilename);

    // Ensure the firmas directory exists
    fs.mkdirSync(path.join(__dirname, "firmas"), { recursive: true });

    // Save the image file
    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        console.error("Error saving signature:", err);
        return res.status(500).json({ error: "Failed to save signature" });
      }

      // Prepare SQL data to save to MySQL
      const sql = "INSERT INTO estudio_socioeconomico SET ?";
      const formData = {
        ...otherData,
        nombreSolicitante,
        firma: firmaFilename,
      };

      // Insert form data into MySQL
      DB.query(sql, formData, (err, result) => {
        if (err) {
          console.error("Error saving to database:", err);
          return res.status(500).json({ error: "Failed to save form data" });
        }

        res
          .status(200)
          .json({ message: "Form and signature saved successfully" });
      });
    });
  } else {
    res.status(400).json({ error: "No signature provided" });
  }
});

// Get all delivery records
app.get("/api/check-delivery", (req, res) => {
  const { nombre } = req.query;
  console.log("Received nombre from frontend:", nombre); // Log the received value

  const query =
    "SELECT * FROM estudio_socioeconomico WHERE nombre_solicitante LIKE ?";
  DB.query(query, [`%${nombre}%`], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.json(result);
  });
});
