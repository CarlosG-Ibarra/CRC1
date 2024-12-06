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

// Create FirmasVales directory if it doesn't exist
const firmasDir = path.join(__dirname, 'FirmasVales');
if (!fs.existsSync(firmasDir)){
    fs.mkdirSync(firmasDir, { recursive: true });
    console.log('Created FirmasVales directory at:', firmasDir);
}

// Serve signature files from FirmasVales directory
app.use('/FirmasVales', express.static(path.join(__dirname, 'FirmasVales')));

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


//Busqueda de vales
app.get("/registro_vales", (req, res) => {
  try {
    const { term, date } = req.query;
    let SQL_QUERY = "SELECT * FROM registro_vales";
    let queryParams = [];
    let conditions = [];

    if (term) {
      const monthMap = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
        'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
        'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
      };

      const yearMatch = term.match(/^[0-9]{4}$/);
      
      let foundMonth = null;
      Object.entries(monthMap).forEach(([monthName, monthNum]) => {
        if (term.toLowerCase().includes(monthName)) {
          foundMonth = monthNum;
        }
      });

      if (yearMatch) {
        conditions.push("YEAR(fecha_entrega) = ?");
        queryParams.push(term);
      } else if (foundMonth) {
        conditions.push("MONTH(fecha_entrega) = ?");
        queryParams.push(foundMonth);
      } else {
        conditions.push("(LOWER(tipo) LIKE LOWER(?) OR LOWER(solicitante) LIKE LOWER(?) OR LOWER(dependencia) LIKE LOWER(?))");
        const searchTerm = `%${term}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
    }

    if (date) {
      conditions.push("DATE(fecha_entrega) = ?");
      queryParams.push(date);
    }

    if (conditions.length > 0) {
      SQL_QUERY += " WHERE " + conditions.join(" AND ");
    }

    SQL_QUERY += " ORDER BY fecha_entrega DESC";

    DB.query(SQL_QUERY, queryParams, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los vales" });
      }

      if (!results || results.length === 0) {
        return res.status(200).json([]);
      }

      const processedResults = results.map(vale => ({
        ...vale,
        tipo: vale.tipo || 'N/A',
        fecha_entrega: vale.fecha_entrega || null,
        solicitante: vale.solicitante || '',
        dependencia: vale.dependencia || '',
        recipiente: vale.recipiente || ''
      }));

      res.status(200).json(processedResults);
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
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
        return res.status(401).send({ message: "Usuario no encontrado" });
      }

      const user = results[0];

      // Compare plain text password
      if (user.pass !== pass) {
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

// Endpoint para registrar vales
app.post("/registro_vales", async (req, res) => {
  let firma1Path, firma2Path; // Declare these at the top
  
  console.log('Received request body:', req.body); // Add logging

  const {
    Fecha,
    Solicitante,
    Recipiente,
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
    Pinatas,
    Juguetes,
    Firma1,
    Firma2,
    tipo  
  } = req.body;

  // Promisify the query function
  const query = (sql, values) => {
    return new Promise((resolve, reject) => {
      DB.query(sql, values, (error, results) => {
        if (error) {
          console.error('Database error:', error); // Add logging
          reject(error);
        } else {
          console.log('Query results:', results); // Add logging
          resolve(results);
        }
      });
    });
  };

  try {
    if (!tipo || !['entrada', 'salida'].includes(tipo)) {
      throw new Error("tipo is required and must be either 'entrada' or 'salida'");
    }

    // Format date for filename
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    // Create filenames for signatures
    const firma1FileName = `${Solicitante}_${dateStr}_entrega.png`.replace(/\s+/g, '_');
    const firma2FileName = `${Recipiente}_${dateStr}_recibe.png`.replace(/\s+/g, '_');

    // Save signature files
    firma1Path = path.join(firmasDir, firma1FileName);
    firma2Path = path.join(firmasDir, firma2FileName);

    console.log('Saving signatures to:', { firma1Path, firma2Path }); // Add logging

    // Save the base64 data as images
    if (Firma1) {
      const firma1Data = Buffer.from(Firma1.split(',')[1], 'base64');
      fs.writeFileSync(firma1Path, firma1Data);
    }

    if (Firma2) {
      const firma2Data = Buffer.from(Firma2.split(',')[1], 'base64');
      fs.writeFileSync(firma2Path, firma2Data);
    }

    // Start transaction
    console.log('Starting transaction'); // Add logging
    await query('START TRANSACTION');

    // 1. First, insert the vale into registro_vales
    const valeData = {
      fecha_entrega: Fecha,
      solicitante: Solicitante,
      recipiente: Recipiente,
      dependencia: Dependencia,
      cantidad_despensas: Despensas || 0,
      cantidad_mochilas_primaria: MochilaPrimaria || 0,
      cantidad_mochilas_secundaria: MochilasSecundaria || 0,
      cantidad_mochilas_preparatoria: MochilasPreparatoria || 0,
      cantidad_colchonetas: Colchonetas || 0,
      cantidad_aguas: Aguas || 0,
      cantidad_botes_pintura: Pintura || 0,
      cantidad_botes_impermeabilizante: Impermeabilizante || 0,
      cantidad_bicicletas: Bicicletas || 0,
      cantidad_mesas: Mesas || 0,
      cantidad_sillas: Sillas || 0,
      cantidad_dulces: Dulces || 0,
      cantidad_pinatas: Pinatas || 0,
      cantidad_juguetes: Juguetes || 0,
      firma_entrega: firma1FileName,
      firma_recibe: firma2FileName,
      tipo
    };

    console.log('Inserting vale with data:', valeData); // Add logging

    await query('INSERT INTO registro_vales SET ?', valeData);

    // 2. Update inventory based on vale type
    const inventoryFields = [
      'Despensas', 'MochilaPrimaria', 'MochilasSecundaria', 
      'MochilasPreparatoria', 'Colchonetas', 'Aguas', 'Pintura',
      'Impermeabilizante', 'Bicicletas', 'Mesas', 'Sillas',
      'Dulces', 'Pinatas', 'Juguetes'
    ];

    for (const field of inventoryFields) {
      const quantity = parseInt(req.body[field]) || 0;
      if (quantity > 0) {
        if (tipo === 'entrada') {
          console.log(`Updating inventory for ${field}, adding ${quantity}`); // Add logging
          await query(
            `UPDATE inventario 
             SET ${field} = ${field} + ? 
             WHERE id = 1`,
            [quantity]
          );
        } else if (tipo === 'salida') {
          // Check if enough inventory exists
          const [inventory] = await query(
            `SELECT ${field} FROM inventario WHERE id = 1`
          );

          console.log(`Current inventory for ${field}:`, inventory); // Add logging

          if (!inventory || inventory[field] < quantity) {
            throw new Error(`Inventario insuficiente de ${field}. Disponible: ${inventory ? inventory[field] : 0}`);
          }

          await query(
            `UPDATE inventario 
             SET ${field} = ${field} - ? 
             WHERE id = 1`,
            [quantity]
          );
        }
      }
    }

    // If everything succeeded, commit the transaction
    console.log('Committing transaction'); // Add logging
    await query('COMMIT');
    
    res.json({ 
      message: `Vale de ${tipo} registrado exitosamente y inventario actualizado`,
      firma1: firma1FileName,
      firma2: firma2FileName
    });

  } catch (error) {
    console.error('Error in vale processing:', error); // Add logging
    // If anything failed, rollback the transaction
    try {
      await query('ROLLBACK');
      console.log('Transaction rolled back'); // Add logging
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }

    // Delete any created signature files
    try {
      if (firma1Path && fs.existsSync(firma1Path)) fs.unlinkSync(firma1Path);
      if (firma2Path && fs.existsSync(firma2Path)) fs.unlinkSync(firma2Path);
      console.log('Signature files deleted'); // Add logging
    } catch (deleteError) {
      console.error('Error deleting signature files:', deleteError);
    }

    res.status(500).json({ 
      error: error.message || 'Error al procesar el vale' 
    });
  }
});

// Get all vales
app.get("/vales", (req, res) => {
  const query = "SELECT * FROM registro_vales ORDER BY fecha_entrega DESC";
  
  DB.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener vales:", err);
      res.status(500).json({ error: "Error al obtener los vales" });
    } else {
      res.json(result);
    }
  });
});

// Get inventory endpoint
app.get("/inventario", (req, res) => {
  const query = "SELECT * FROM inventario";
  
  DB.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching inventory:", err);
      res.status(500).json({ error: "Error al obtener el inventario" });
      return;
    }
    res.json(result);
  });
});
