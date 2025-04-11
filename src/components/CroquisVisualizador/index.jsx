import { useState } from "react";
import styles from "./CroquisVisualizador.module.css";

const CroquisVisualizador = ({
  estadoParqueos,
  onCancelarReserva,
  onReservarParqueo,
  onEntradaVisita,
  onSalidaVisita,
}) => {
  const [hoveredParqueo, setHoveredParqueo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [selectedJornadaId, setSelectedJornadaId] = useState(null);
  const [selectedParqueo, setSelectedParqueo] = useState(null);

  // Configuración de las secciones
  const secciones = {
    administrativos: {
      id: "A",
      nombre: "ADMINISTRATIVOS",
      position: "left",
    },
    estudiantes: {
      id: "E",
      nombre: "ESTUDIANTES",
      position: "center",
    },
    visitantes: {
      id: "V",
      nombre: "VISITANTES",
      position: "right",
    },
  };

  const getDetalleParqueo = (numeroParqueo) => {
    return (
      estadoParqueos.find((p) => p.PAR_NUMERO_PARQUEO === numeroParqueo) || {
        EJOR_ESTADO_ID: 0,
        RES_RESERVACION_ID: null,
        RES_ID_USUARIO: null,
        JOR_JORNADA_ID: null,
      }
    );
  };

  const handleOpenModal = (tipo, jornadaId = null, numeroParqueo = null) => {
    setModalTipo(tipo);
    setSelectedJornadaId(jornadaId);
    setSelectedParqueo(numeroParqueo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsuarioId("");
  };

  const handleConfirmAction = () => {
    if (modalTipo === "entrada") {
      onEntradaVisita(usuarioId, selectedParqueo);
    } else if (modalTipo === "reserva") {
      onReservarParqueo(selectedJornadaId, usuarioId);
    }
    handleCloseModal();
  };

  const renderParqueo = (numeroParqueo, seccion) => {
    const parqueo = getDetalleParqueo(numeroParqueo);
    const estaOcupado = parqueo.EJOR_ESTADO_ID === 2;
    const estaDisponible = parqueo.EJOR_ESTADO_ID === 1;

    return (
      <div
        key={`parqueo-${numeroParqueo}`}
        className={`${styles.celda} ${
          estaOcupado
            ? styles.ocupado
            : estaDisponible
            ? styles.libre
            : styles.indisponible
        }`}
        onMouseEnter={() => setHoveredParqueo(numeroParqueo)}
        onMouseLeave={() => setHoveredParqueo(null)}
      >
        <div className={styles.numero}>{numeroParqueo}</div>

        {hoveredParqueo === numeroParqueo && (
          <div className={styles.tooltip}>
            <div>
              <strong>Sección:</strong> {seccion.nombre}
            </div>
            <div>
              <strong>Estado:</strong>{" "}
              {estaOcupado
                ? "OCUPADO"
                : estaDisponible
                ? "DISPONIBLE"
                : "NO DISPONIBLE"}
            </div>

            {estaOcupado && (
              <>
                <div>
                  <strong>ID Usuario:</strong> {parqueo.RES_ID_USUARIO}
                </div>
               
                {seccion.id === "V" ? (
                  <button
                    className={styles.botonCancelar}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSalidaVisita(parqueo.RES_RESERVACION_ID);
                    }}
                  >
                    Registrar Salida {/* Cambiar texto */}
                  </button>
                ) : (
                  <button
                    className={styles.botonCancelar}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelarReserva(parqueo.RES_RESERVACION_ID);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </>
            )}

            {estaDisponible && (
              <button
                className={styles.botonReservar}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(
                    "reserva",
                    parqueo.JOR_JORNADA_ID,
                    numeroParqueo
                  );
                }}
              >
                Reservar
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAdministrativos = () => {
    return (
      <div className={styles.columnasConEspacio}>
        {/* Columna izquierda (71-81) */}
        <div className={styles.columnaVertical}>
          {Array.from({ length: 10 }, (_, i) =>
            renderParqueo(71 + i, secciones.administrativos)
          )}
        </div>

        {/* Espacio central */}
        <div className={styles.espacioEntreColumnas}></div>

        {/* Columna derecha (80-90) */}
        <div className={styles.columnaVertical}>
          {Array.from({ length: 10 }, (_, i) =>
            renderParqueo(81 + i, secciones.administrativos)
          )}
        </div>
      </div>
    );
  };

  const renderVisitantes = () => {
    return (
      <div className={styles.columnasConEspacio}>
        {/* Columna izquierda (91-95) */}
        <div className={styles.columnaVertical}>
          {Array.from({ length: 5 }, (_, i) =>
            renderParqueo(91 + i, secciones.visitantes)
          )}
        </div>

        {/* Espacio central */}
        <div className={styles.espacioEntreColumnas}></div>

        {/* Columna derecha (96-100) */}
        <div className={styles.columnaVertical}>
          {Array.from({ length: 5 }, (_, i) =>
            renderParqueo(96 + i, secciones.visitantes)
          )}
        </div>
      </div>
    );
  };

  const renderEstudiantes = () => {
    return (
      <div className={styles.gridEstudiantes}>
        {/* Primera fila (1-14) */}
        <div className={styles.fila}>
          {Array.from({ length: 12 }, (_, i) =>
            renderParqueo(1 + i, secciones.estudiantes)
          )}
        </div>
        <div className={styles.fila}>
          {Array.from({ length: 12 }, (_, i) =>
            renderParqueo(13 + i, secciones.estudiantes)
          )}
        </div>

        {/* Espacio */}
        <div className={styles.espacioHorizontal}></div>

        {/* Bloque central (17-48) */}
        <div className={styles.fila}>
          {Array.from({ length: 12 }, (_, i) =>
            renderParqueo(25 + i, secciones.estudiantes)
          )}
        </div>
        <div className={styles.fila}>
          {Array.from({ length: 12 }, (_, i) =>
            renderParqueo(37 + i, secciones.estudiantes)
          )}
        </div>

        {/* Espacio */}
        <div className={styles.espacioHorizontal}></div>

        {/* Bloque inferior (49-70) */}
        <div className={styles.fila}>
          {Array.from({ length: 12 }, (_, i) =>
            renderParqueo(49 + i, secciones.estudiantes)
          )}
        </div>
        <div className={styles.fila}>
          {Array.from({ length: 10 }, (_, i) =>
            renderParqueo(61 + i, secciones.estudiantes)
          )}
        </div>
      </div>
    );
  };

  const renderSeccion = (seccion) => {
    return (
      <div
        key={seccion.id}
        className={`${styles.seccionEstudiantes} ${styles[seccion.position]}`}
      >
        <h3 className={styles.tituloSeccion}>{seccion.nombre}</h3>
        <div className={styles.contenidoSeccion}>
          {seccion.id === "A" && renderAdministrativos()}
          {seccion.id === "E" && renderEstudiantes()}
          {seccion.id === "V" && renderVisitantes()}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.contenedor}>
      {/* Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>
              {modalTipo === "reserva"
                ? "Reservar Parqueo"
                : "Registrar Entrada"}
            </h3>
            <div className={styles.modalFormGroup}>
              <label>ID de Usuario:</label>

              <input
                type="number"
                inputMode="numeric" // Sugiere al teclado mostrar solo números
                pattern="[0-9]*" // Expresión regular para aceptar solo dígitos
                min="1"
                value={usuarioId}
                placeholder="Ingrese ID"
                onChange={(e) => setUsuarioId(e.target.value)}
                onKeyDown={(e) => {
                  // Permitir solo dígitos y teclas de control básicas
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  // Si la tecla presionada no es un dígito y tampoco está en la lista permitida, bloquearla
                  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  // Obtiene el texto pegado y verifica que solo contenga dígitos
                  const pastedData = e.clipboardData.getData("Text");
                  if (!/^\d+$/.test(pastedData)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={handleCloseModal}>
                Cancelar
              </button>
              <button
                className={styles.modalConfirm}
                onClick={handleConfirmAction}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plano completo */}
      <div className={styles.planoCompleto}>
        {renderSeccion(secciones.administrativos)}
        {renderSeccion(secciones.estudiantes)}
        {renderSeccion(secciones.visitantes)}
      </div>
    </div>
  );
};

export default CroquisVisualizador;
