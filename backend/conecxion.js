const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); 
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

// Habilitar CORS
app.use(cors());

// Middleware para analizar solicitudes JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // Para analizar datos de formularios

// Conexión a la base de datos
DB.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Conexión exitosa");
});

// Crear directorio FirmasVales si no existe
const firmasDir = path.join(__dirname, 'FirmasVales');
if (!fs.existsSync(firmasDir)){
    fs.mkdirSync(firmasDir, { recursive: true });
}

// Servir archivos de firmas desde el directorio FirmasVales
app.use('/FirmasVales', express.static(path.join(__dirname, 'FirmasVales')));

// Configuración de almacenamiento Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes"); // Guardar archivos en el directorio 'imagenes'
  },
  filename: (req, file, cb) => {
    if (!req.body.nombreSolicitante) {
      return cb(new Error("Nombre del solicitante es requerido"), null);
    }

    // Generar un nombre único para cada archivo
    const uniqueName = `${req.body.nombreSolicitante}-${
      file.fieldname
    }${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Inicializar Multer con la configuración de almacenamiento
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar tamaño de archivo a 5MB
});

// Endpoint para subir archivos
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
      // Verificar que al menos un archivo fue subido
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No se subieron archivos." });
      }

      // Extraer nombres de archivos subidos
      const filenames = {
        ine1Name: req.files.ine1 ? req.files.ine1[0].filename : null,
        ine2Name: req.files.ine2 ? req.files.ine2[0].filename : null,
        ine3Name: req.files.ine3 ? req.files.ine3[0].filename : null,
        firmaName: req.files.firma ? req.files.firma[0].filename : null,
      };

      res.json({ message: "Archivos subidos exitosamente", filenames });
    } catch (error) {
      res.status(500).json({ message: "Error al subir archivos.", error });
    }
  }
);

// Middleware para manejo de errores de Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Manejar errores específicos de Multer
    return res
      .status(400)
      .json({ message: "Error de Multer", error: err.message });
  } else if (err) {
    // Manejar otros errores
    return res
      .status(500)
      .json({ message: "Error del servidor", error: err.message });
  }
  next();
});

// Endpoint para buscar en la tabla Registros
app.get("/api/check-registros", (req, res) => {
  const nombre = req.query.nombre;
  
  if (!nombre) {
    return res.status(400).json({ message: "Nombre es requerido" });
  }

  const query = `
    SELECT *
    FROM Registros
    WHERE nombre_solicitante LIKE ? 
    LIMIT 5
  `;

  DB.query(query, [`%${nombre}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        message: "Error al buscar nombres", 
        error: err 
      });
    }
    res.json(results);
  });
});

// Endpoint para registro o actualización de despensas
app.post("/registro-despensas", (req, res) => {
  const { id_registro, nombre, calle, numero, colonia, cp, telefono, zona } = req.body;

  // Verificar campos requeridos
  if (!nombre || !calle || !numero || !colonia || !cp || !telefono || !zona) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  // Almacenar como string para preservar el número completo
  const telString = telefono.replace(/\D/g, '');
  
  if (!telString) {
    return res.status(400).json({ message: "Número de teléfono inválido" });
  }

  if (id_registro) {
    // Actualizar registro existente
    const updateQuery = `
      UPDATE Registros 
      SET nombre_solicitante = ?, 
          calle = ?, 
          numero = ?, 
          colonia = ?, 
          cp = ?, 
          tel = ?, 
          zona = ?,
          ruta = 0
      WHERE id_registro = ?
    `;

    const updateValues = [nombre, calle, numero, colonia, cp, telString, zona, id_registro];

    DB.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error en el servidor." });
      }

      res.status(200).json({ 
        message: "Actualización exitosa", 
        id_registro: id_registro 
      });
    });
  } else {
    // Crear nuevo registro
    const insertQuery = `
      INSERT INTO Registros 
      (nombre_solicitante, calle, numero, colonia, cp, tel, zona, ruta)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const insertValues = [nombre, calle, numero, colonia, cp, telString, zona];

    DB.query(insertQuery, insertValues, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error en el servidor." });
      }

      res.status(201).json({ 
        message: "Registro exitoso", 
        id_registro: result.insertId 
      });
    });
  }
});

// Endpoint para estudio socioeconómico
app.post("/api/estudio-socioeconomico", (req, res) => {
  const formData = req.body;

  // Campos requeridos
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

  // Poblar datos, estableciendo campos faltantes en null
  const data = {};
  for (const field of requiredFields) {
    data[field] = formData[field] || null; // Utilizar null para valores faltantes
  }

  // Generar consulta SQL
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data).map(value => (value !== null ? `'${value}'` : "NULL")).join(", ");
  const sql = `INSERT INTO estudio_socioeconomico (${columns}) VALUES (${values})`;

  // Ejecutar la consulta SQL
  DB.query(sql, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({ message: "Error en la base de datos", detalles: err.message });
    }

    // Si todo está bien, devolver éxito con resultado
    res.status(200).json({ message: "Datos insertados exitosamente", result });
  });
});

// Endpoint para obtener registros con ruta = 0
app.get("/registros/sin-ruta", (req, res) => {
  const query = `
    SELECT 
      id_registro,
      nombre_solicitante,
      calle,
      numero,
      colonia,
      zona,
      ruta
    FROM Registros 
    WHERE ruta = 0 OR ruta IS NULL
  `;
  
  DB.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los registros:", err);
      return res.status(500).json({ 
        message: "Error al obtener registros sin ruta", 
        error: err 
      });
    }
    res.json(results);
  });
});

// Endpoint para actualizar la ruta de un registro
app.post("/registro/actualizar-ruta", (req, res) => {
  const { id_registro, ruta } = req.body;
  
  const query = "UPDATE Registros SET ruta = ? WHERE id_registro = ?";
  
  DB.query(query, [ruta, id_registro], (err, results) => {
    if (err) {
      console.error("Error al actualizar el registro:", err);
      return res.status(500).json({ message: "Error en el servidor." });
    }
    res.status(200).json({ message: "Ruta actualizada correctamente." });
  });
});

// Endpoint para búsqueda de vales
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

// Endpoint para registro de usuarios
app.post("/register", (req, res) => {
  const { nombre, email, pass, nivel } = req.body;

  // Validación básica de entrada
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
        .json({ error: "Error al registrar el usuario.", detalles: err });
    }
    res
      .status(200)
      .json({ message: "Usuario registrado exitosamente", result });
  });
});

// Endpoint para inicio de sesión
app.post("/login", (req, res) => {
  const { email, pass } = req.body;
  
  // Verificar si el usuario existe
  DB.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error en la base de datos:", err); // Registrar error en la base de datos
        return res.status(500).send({ message: "Error en la base de datos" });
      }

      if (results.length === 0) {
        return res.status(401).send({ message: "Usuario no encontrado" });
      }

      const user = results[0];

      // Comparar contraseña en texto plano
      if (user.pass !== pass) {
        return res.status(401).send({ message: "Contraseña incorrecta" });
      }

      // Autenticación exitosa, incluir el campo 'nivel' en la respuesta
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

// Endpoint para obtener el nivel de un usuario
app.get("/getUserNivel/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = "SELECT nivel FROM usuarios WHERE id_usuario = ?";
  DB.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send("Error al obtener el nivel del usuario");
    }
    if (results.length > 0) {
      res.json({ nivel: results[0].nivel });
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  });
});

// Endpoint para obtener todos los usuarios
app.get("/usuarios", (req, res) => {
  // Mantener req aquí, incluso si no se utiliza
  const query = "SELECT * FROM usuarios";
  DB.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al obtener los usuarios");
    }
    res.json(results); // Enviar los resultados como JSON
  });
});

// Endpoint para eliminar un usuario por ID
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM usuarios WHERE id_usuario = ?";
  DB.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al eliminar el usuario");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.send("Usuario eliminado exitosamente");
  });
});

// Endpoint para guardar el formulario y la firma
app.post("/api/submit-form", (req, res) => {
  const { nombreSolicitante, firmaFilename, signatureDataURL, ...otherData } =
    req.body;

  if (signatureDataURL) {
    // Eliminar el prefijo de URL base64
    const base64Data = signatureDataURL.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, "firmas", firmaFilename);

    // Asegurarse de que el directorio firmas exista
    fs.mkdirSync(path.join(__dirname, "firmas"), { recursive: true });

    // Guardar el archivo de imagen
    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        console.error("Error al guardar la firma:", err);
        return res.status(500).json({ error: "Error al guardar la firma" });
      }

      // Preparar datos SQL para guardar en MySQL
      const sql = "INSERT INTO estudio_socioeconomico SET ?";
      const formData = {
        ...otherData,
        nombreSolicitante,
        firma: firmaFilename,
      };

      // Insertar datos del formulario en MySQL
      DB.query(sql, formData, (err, result) => {
        if (err) {
          console.error("Error al guardar en la base de datos:", err);
          return res.status(500).json({ error: "Error al guardar los datos del formulario" });
        }

        res
          .status(200)
          .json({ message: "Formulario y firma guardados exitosamente" });
      });
    });
  } else {
    res.status(400).json({ error: "No se proporcionó firma" });
  }
});

// Endpoint para buscar en ambas tablas
app.get("/api/check-delivery", (req, res) => {
  const nombre = req.query.nombre;
  
  if (!nombre) {
    return res.status(400).json({ message: "Nombre es requerido" });
  }

  // Primero buscar en estudio_socioeconomico
  const queryEstudio = `
    SELECT 
      nombre_solicitante, motivo, edad, colonia, calle, numero, tel, zona, cp,
      sexo, genero, escolaridad, ocupacion, estado_civil,
      nombre_1, sexo_integrante_1, parentesco_1, edad_integrante_1, estado_civil_integrante_1,
      ocupacion_integrante_1, escolaridad_integrante_1, ingreso_sol1,
      nombre_2, sexo_integrante_2, parentesco_2, edad_integrante_2, estado_civil_integrante_2,
      ocupacion_integrante_2, escolaridad_integrante_2, ingreso_sol2,
      nombre_3, sexo_integrante_3, parentesco_3, edad_integrante_3, estado_civil_integrante_3,
      ocupacion_integrante_3, escolaridad_integrante_3, ingreso_sol3,
      ingreso_mensual, aportacion, luz, agua, telefono, creditos, gas, medicinas,
      transporte, television, renta, alimentacion, escuela, internet, total,
      vehiculo, situacionLegal, materialParedes, materialTecho, materialPiso,
      numCuartos, nivelSocioEconomico,
      'estudio_socioeconomico' as source
    FROM estudio_socioeconomico
    WHERE nombre_solicitante LIKE ? 
    LIMIT 5
  `;

  // Buscar primero en estudio_socioeconomico
  DB.query(queryEstudio, [`%${nombre}%`], (err, estudioResults) => {
    if (err) {
      return res.status(500).json({ 
        message: "Error al buscar en estudio socioeconómico", 
        error: err 
      });
    }

    // Si encontramos resultados en estudio_socioeconomico, devolverlos inmediatamente
    if (estudioResults && estudioResults.length > 0) {
      return res.json(estudioResults.map(result => ({
        ...result,
        source: 'estudio_socioeconomico'
      })));
    }

    // Si no hay resultados en estudio_socioeconomico, buscar en Registros
    const queryRegistros = `
      SELECT 
        nombre_solicitante, calle, numero, colonia, cp, tel, zona,
        'registros' as source
      FROM Registros
      WHERE nombre_solicitante LIKE ? 
      LIMIT 5
    `;

    DB.query(queryRegistros, [`%${nombre}%`], (err, registrosResults) => {
      if (err) {
        return res.status(500).json({ 
          message: "Error al buscar en registros", 
          error: err 
        });
      }

      // Devolver resultados de Registros
      res.json(registrosResults.map(result => ({
        ...result,
        source: 'registros'
      })));
    });
  });
});

// Endpoint para registrar vales
app.post("/registro_vales", async (req, res) => {
  let firma1Path, firma2Path; // Declarar estas variables al principio
  
  console.log('Solicitud recibida:', req.body); // Agregar registro

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

  // Promisificar la función de consulta
  const query = (sql, values) => {
    return new Promise((resolve, reject) => {
      DB.query(sql, values, (error, results) => {
        if (error) {
          console.error('Error en la base de datos:', error); // Agregar registro
          reject(error);
        } else {
          console.log('Resultados de la consulta:', results); // Agregar registro
          resolve(results);
        }
      });
    });
  };

  try {
    if (!tipo || !['entrada', 'salida'].includes(tipo)) {
      throw new Error("tipo es requerido y debe ser 'entrada' o 'salida'");
    }

    // Formatear fecha para el nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    // Crear nombres de archivo para firmas
    const firma1FileName = `${Solicitante}_${dateStr}_entrega.png`.replace(/\s+/g, '_');
    const firma2FileName = `${Recipiente}_${dateStr}_recibe.png`.replace(/\s+/g, '_');

    // Guardar archivos de firma
    firma1Path = path.join(firmasDir, firma1FileName);
    firma2Path = path.join(firmasDir, firma2FileName);

    console.log('Guardando firmas en:', { firma1Path, firma2Path }); // Agregar registro

    // Guardar datos base64 como imágenes
    if (Firma1) {
      const firma1Data = Buffer.from(Firma1.split(',')[1], 'base64');
      fs.writeFileSync(firma1Path, firma1Data);
    }

    if (Firma2) {
      const firma2Data = Buffer.from(Firma2.split(',')[1], 'base64');
      fs.writeFileSync(firma2Path, firma2Data);
    }

    // Iniciar transacción
    console.log('Iniciando transacción'); // Agregar registro
    await query('START TRANSACTION');

    // 1. Primero, insertar el vale en registro_vales
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

    console.log('Insertando vale con datos:', valeData); // Agregar registro

    await query('INSERT INTO registro_vales SET ?', valeData);

    // 2. Actualizar inventario según el tipo de vale
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
          console.log(`Actualizando inventario para ${field}, agregando ${quantity}`); // Agregar registro
          await query(
            `UPDATE inventario 
             SET ${field} = ${field} + ? 
             WHERE id = 1`,
            [quantity]
          );
        } else if (tipo === 'salida') {
          // Verificar si hay suficiente inventario
          const [inventory] = await query(
            `SELECT ${field} FROM inventario WHERE id = 1`
          );

          console.log(`Inventario actual para ${field}:`, inventory); // Agregar registro

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

    // Si todo salió bien, confirmar la transacción
    console.log('Confirmar transacción'); // Agregar registro
    await query('COMMIT');
    
    res.json({ 
      message: `Vale de ${tipo} registrado exitosamente y inventario actualizado`,
      firma1: firma1FileName,
      firma2: firma2FileName
    });

  } catch (error) {
    console.error('Error al procesar el vale:', error); // Agregar registro
    // Si algo falló, revertir la transacción
    try {
      await query('ROLLBACK');
      console.log('Transacción revertida'); // Agregar registro
    } catch (rollbackError) {
      console.error('Error al revertir la transacción:', rollbackError);
    }

    // Eliminar archivos de firma creados
    try {
      if (firma1Path && fs.existsSync(firma1Path)) fs.unlinkSync(firma1Path);
      if (firma2Path && fs.existsSync(firma2Path)) fs.unlinkSync(firma2Path);
      console.log('Archivos de firma eliminados'); // Agregar registro
    } catch (deleteError) {
      console.error('Error al eliminar archivos de firma:', deleteError);
    }

    res.status(500).json({ 
      error: error.message || 'Error al procesar el vale' 
    });
  }
});

// Endpoint para obtener todos los vales
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

// Endpoint para obtener el inventario
app.get("/inventario", (req, res) => {
  const query = "SELECT * FROM inventario";
  
  DB.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener el inventario:", err);
      res.status(500).json({ error: "Error al obtener el inventario" });
      return;
    }
    res.json(result);
  });
});
