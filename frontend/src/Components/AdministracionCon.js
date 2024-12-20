import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdministracionCon.css"; 

function AdministracionCon() {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3001/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="consulta-container">
      <h1 id="consulta-header">Consultas</h1>
      <input
        id="consulta-search"
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table id="consulta-table">
        <thead id="consulta-table-head">
          <tr>
            <th>ID Usuario</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Password</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsuarios.length > 0 ? (
            filteredUsuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.id_usuario}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.pass}</td>
                <td>{usuario.nivel}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No se encontraron usuarios.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdministracionCon;
