import React, { useState, useEffect } from 'react';
import './Inventario.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, faSchool, faGraduationCap, faUserGraduate,
  faBed, faWater, faPaintRoller, faShield,
  faBicycle, faTable, faChair, faCandyCane,
  faBirthdayCake, faGamepad
} from '@fortawesome/free-solid-svg-icons';

function Inventario() {
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const response = await fetch('http://localhost:3001/inventario');
      if (!response.ok) {
        throw new Error('Error al cargar el inventario');
      }
      const data = await response.json();
      setInventario(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const items = [
    { name: 'Despensas', dbName: 'Despensas', icon: faBox },
    { name: 'Mochilas Primaria', dbName: 'MochilaPrimaria', icon: faSchool },
    { name: 'Mochilas Secundaria', dbName: 'MochilasSecundaria', icon: faGraduationCap },
    { name: 'Mochilas Preparatoria', dbName: 'MochilasPreparatoria', icon: faUserGraduate },
    { name: 'Colchonetas', dbName: 'Colchonetas', icon: faBed },
    { name: 'Aguas', dbName: 'Aguas', icon: faWater },
    { name: 'Pintura', dbName: 'Pintura', icon: faPaintRoller },
    { name: 'Impermeabilizante', dbName: 'Impermeabilizante', icon: faShield },
    { name: 'Bicicletas', dbName: 'Bicicletas', icon: faBicycle },
    { name: 'Mesas', dbName: 'Mesas', icon: faTable },
    { name: 'Sillas', dbName: 'Sillas', icon: faChair },
    { name: 'Dulces', dbName: 'Dulces', icon: faCandyCane },
    { name: 'Piñatas', dbName: 'Pinatas', icon: faBirthdayCake },
    { name: 'Juguetes', dbName: 'Juguetes', icon: faGamepad }
  ];

  return (
    <div className="inventario-container">
      <h1>Inventario</h1>
      <div className="inventario-grid">
        {items.map((item) => (
          <div key={item.name} className="inventario-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={item.icon} className="item-icon" />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="cantidad">
                <span className="value">
                  {inventario.length > 0 ? inventario[0][item.dbName] || 0 : 0}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inventario;