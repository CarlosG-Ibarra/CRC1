import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdministracionBaja.css";

function AdministracionBaja() {
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

  const handleDelete = async (id_usuario) => {
    try {
      await axios.delete(`http://localhost:3001/usuarios/${id_usuario}`);
      fetchUsuarios();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Filter users based on the search term
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="baja-container">
      <h1 id="baja-header">Bajas</h1>
      <input
        type="text"
        id="baja-search"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table id="baja-table">
        <thead id="baja-table-head">
          <tr>
            <th>ID Usuario</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Password</th>
            <th>Nivel</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.pass}</td>
              <td>{usuario.nivel}</td>
              <td>
                <button onClick={() => handleDelete(usuario.id_usuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdministracionBaja;
