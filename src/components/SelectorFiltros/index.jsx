import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './SelectorFiltros.module.css';

const SECCIONES = [
  { value: "E", label: "ESTUDIANTES" },
  { value: "A", label: "ADMINISTRATIVOS" },
  { value: "V", label: "VISITANTES" }
];

const SelectorFiltros = ({
  section = "E",  // Valor por defecto: Estudiantes
  jornada = "",
  onSectionChange,
  onJornadaChange,
  jornadasDisponibles = []
}) => {
  const handleSectionChange = useCallback((e) => {
    onSectionChange(e.target.value);
    onJornadaChange(""); // Resetear jornada
  }, [onSectionChange, onJornadaChange]);

  const handleJornadaChange = useCallback((e) => {
    onJornadaChange(e.target.value);
  }, [onJornadaChange]);

  return (
    <div className={styles.contenedor}>
      <div className={styles.grupo}>
        <label htmlFor="seccion-select">Sección:</label>
        <select
          id="seccion-select"
          value={section}
          onChange={handleSectionChange}
          className={styles.select}
        >
          {SECCIONES.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grupo}>
        <label htmlFor="jornada-select">Jornada:</label>
        <select
          id="jornada-select"
          value={jornada}
          onChange={handleJornadaChange}
          className={styles.select}
          disabled={!section}
        >
          
          {jornadasDisponibles.map((j) => (
            <option key={j} value={j}>
              {j.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

SelectorFiltros.propTypes = {
  section: PropTypes.oneOf(["E", "A", "V"]),
  jornada: PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
  onJornadaChange: PropTypes.func.isRequired,
  jornadasDisponibles: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(SelectorFiltros); 