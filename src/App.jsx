import { useState, useEffect, useMemo, useCallback } from 'react';
import SelectorFiltros from './components/SelectorFiltros';
import CroquisVisualizador from './components/CroquisVisualizador';
import styles from './App.module.css';

const App = () => {
  const [section, setSection] = useState('E'); // Valor por defecto: Estudiantes
  const [jornada, setJornada] = useState('');
  const [jornadasDisponibles, setJornadasDisponibles] = useState([]);
  const [estadoParqueos, setEstadoParqueos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelandoId, setCancelandoId] = useState(null);

  const seccionesConfig = useMemo(() => ({
    E: ['MATUTINA', 'VESPERTINA', 'NOCTURNA', 'COMPLETA_SABADO', 'COMPLETA_DOMINGO'],
    A: ['MATUTINA', 'VESPERTINA', 'NOCTURNA', 'COMPLETA_SABADO', 'COMPLETA_DOMINGO','ADMINISTRATIVO'],
    V: ['SEMANA_COMPLETA_VISITAS']
  }), []);

  useEffect(() => {
    if (section) {
      const nuevasJornadas = seccionesConfig[section];
      setJornadasDisponibles(nuevasJornadas);
      setJornada(nuevasJornadas[0]);
    }
  }, [section, seccionesConfig]);

  const fetchDisponibilidad = useCallback(async () => {
    if (section && jornada) {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/disponibilidad_parqueo?JOR_TIPO=${jornada}&SECCION=${section}`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setEstadoParqueos(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [section, jornada]);

  useEffect(() => {
    fetchDisponibilidad();
  }, [fetchDisponibilidad]);

  const handleCancelarReserva = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      setCancelandoId(reservaId);
      setError('');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cancelacion_parqueo`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            RES_RESERVACION_ID: reservaId
          })
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo cancelar la reserva');
      }

      await fetchDisponibilidad();
      alert('Reserva cancelada exitosamente');

    } catch (err) {
      setError(err.message);
    } finally {
      setCancelandoId(null);
    }
  };

  const handleReservarParqueo = async (jornadaId, usuarioId) => {
    try {
      setLoading(true);
      setError('');

      // Validación de datos
      const usuarioIdNum = parseInt(usuarioId);
      const jornadaIdNum = parseInt(jornadaId);

      if (isNaN(usuarioIdNum)) {
        throw new Error('El ID de usuario debe ser un número válido');
      }

      if (isNaN(jornadaIdNum)) {
        throw new Error('La jornada seleccionada no es válida');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/insertar_parqueo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            RES_ID_USUARIO: usuarioIdNum,
            JOR_JORNADA_ID: jornadaIdNum
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(data.message || 'El parqueo ya está reservado o no disponible');
        }
        throw new Error(data.message || `Error al reservar (código ${response.status})`);
      }

      await fetchDisponibilidad();
      alert(data.message || '✅ Parqueo reservado exitosamente');
    } catch (error) {
      console.error('Error en reserva:', error);
      setError(error.message);
      alert(`Error al reservar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleEntradaVisita = async (usuarioId, numeroParqueo) => {
    try {
      setLoading(true);
      setError('');
  
      const usuarioIdNum = parseInt(usuarioId);
      if (isNaN(usuarioIdNum)) {
        throw new Error('El ID de usuario debe ser un número válido');
      }
  
      const parqueoSeleccionado = estadoParqueos.find(p => 
        p.PAR_NUMERO_PARQUEO === numeroParqueo
      );
  
      if (!parqueoSeleccionado) {
        throw new Error(`No se encontró el parqueo ${numeroParqueo}`);
      }
  
      if (parqueoSeleccionado.EJOR_ESTADO_ID !== 1) {
        throw new Error(`El parqueo ${numeroParqueo} no está disponible`);
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/insertar_entrada_visitas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            RES_ID_USUARIO: usuarioIdNum,
            JOR_JORNADA_ID: parqueoSeleccionado.JOR_JORNADA_ID,
            PAR_NUMERO_PARQUEO: numeroParqueo
          })
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(data.message || 'El parqueo ya está ocupado');
        }
        throw new Error(data.message || `Error al registrar entrada: ${response.status}`);
      }
  
      await fetchDisponibilidad();
      alert(data.message || 'Entrada de visita registrada exitosamente');
    } catch (err) {
      console.error('Error en entrada visita:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSalidaVisita = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de que deseas registrar la salida de esta visita?')) {
      return;
    }
  
    try {
      setLoading(true);
      setError('');
  
      // Validación de datos
      const reservaIdNum = parseInt(reservaId);
      if (isNaN(reservaIdNum)) {
        throw new Error('No se proporcionó un ID de reserva válido');
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/insertar_salida_visitas`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            RES_RESERVACION_ID: reservaIdNum
          })
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Error al registrar salida: ${response.status}`);
      }
  
      await fetchDisponibilidad();
      alert(`${data.message || 'Salida registrada exitosamente'}\nID Usuario: ${data.RES_ID_USUARIO}\nTiempo Total: ${data.TIEMPO_TOTAL}`);
    } catch (err) {
      console.error('Error en salida visita:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.contenedorApp}>
        
      <SelectorFiltros
        section={section}
        jornada={jornada}
        onSectionChange={setSection}
        onJornadaChange={setJornada}
        jornadasDisponibles={jornadasDisponibles}
      />

      {loading && <div className={styles.loading}>Cargando...</div>}
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {section && !loading && !error && (
        <CroquisVisualizador 
          section={section}
          estadoParqueos={estadoParqueos}
          onCancelarReserva={handleCancelarReserva}
          onReservarParqueo={handleReservarParqueo}
          onEntradaVisita={handleEntradaVisita}
          onSalidaVisita={handleSalidaVisita}
          cancelandoId={cancelandoId}
        />
      )}
    </div>
  );
};

export default App;