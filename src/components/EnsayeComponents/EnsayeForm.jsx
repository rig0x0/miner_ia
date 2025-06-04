import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router'; // Asegúrate que esta sea la versión correcta de react-router
import * as XLSX from 'xlsx';
import { Modal, Button } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';

export const EnsayeForm = () => {

  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [turno, setTurno] = useState(null);
  const [tipoLaboratorio, setTipoLaboratorio] = useState('');
  const [formData, setFormData] = useState({
    molienda_humeda: '',
    humedad: '',
    cabeza_general: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [circuitos, setCircuitos] = useState([
    { etapa: "Cabeza Flotacion", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Concentrado Pb", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Colas Pb", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Concentrado Zn", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Colas Zn", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Concentrado Fe", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
    { etapa: "Colas Finales", elementos: Array(6).fill().map((_, i) => ({ elemento_id: i + 1, existencia_teorica: '' })) },
  ]);
  const nombresElementos = ["Oro (Au) gr/ton", "Plata (Ag) gr/ton", "Plomo (Pb) %", "Zinc (Zn) %", "Fierro (Fe) %", "Cobre (Cu) %"];
  const [copiado, setCopiado] = useState(null);
  const [archivoCargado, setArchivoCargado] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef(null);
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const inputRefs = useRef([]);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const tutorialRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TUTORIAL_STORAGE_KEY = 'ensayeTutorialVisto';

  useEffect(() => {
    if (paso === 4) {
      const tutorialVisto = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!tutorialVisto) {
        setShowTutorial(true);
        setTutorialStep(1);
      }
    }
  }, [paso]);

  const avanzarPaso = () => setPaso(p => p + 1);
  const volverPaso = () => setPaso(p => p - 1);

  const validarDatosCompletos = () => {
    const errores = [];
    if (!turno) errores.push({ campo: 'Turno', mensaje: 'Seleccione un turno.', pasoAcorregir: 1 });
    if (!tipoLaboratorio) errores.push({ campo: 'Tipo de Laboratorio', mensaje: 'Seleccione un tipo de laboratorio.', pasoAcorregir: 2 });
    if (!formData.molienda_humeda) errores.push({ campo: 'Molienda Húmeda', mensaje: 'Ingrese la molienda húmeda.', pasoAcorregir: 3 });
    if (!formData.humedad) errores.push({ campo: 'Humedad', mensaje: 'Ingrese la humedad.', pasoAcorregir: 3 });
    if (!formData.cabeza_general) errores.push({ campo: 'Cabeza General', mensaje: 'Ingrese la cabeza general.', pasoAcorregir: 3 });

    let circuitosIncompletosCount = 0;
    circuitos.forEach((circuito, cIdx) => {
      circuito.elementos.forEach((elemento, eIdx) => {
        if (elemento.existencia_teorica === '' || elemento.existencia_teorica === null || isNaN(parseFloat(elemento.existencia_teorica))) {
          if (circuitosIncompletosCount === 0) { // Solo agregar el error general de circuitos una vez
            errores.push({ campo: `Circuitos (Etapa: ${circuito.etapa}, Elemento: ${nombresElementos[eIdx]})`, mensaje: 'Complete todos los valores de los circuitos.', pasoAcorregir: 4 });
          }
          circuitosIncompletosCount++;
        }
      });
    });
    if (circuitosIncompletosCount > 0 && !errores.find(e => e.campo.startsWith('Circuitos'))) {
      errores.push({ campo: 'Circuitos', mensaje: `Hay ${circuitosIncompletosCount} valor(es) faltante(s) o inválido(s) en la tabla de circuitos.`, pasoAcorregir: 4 });
    }

    return { esValido: errores.length === 0, errores };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCircuitoChange = (circuitoIndex, elementoIndex, value) => {
    const nuevosCircuitos = [...circuitos];
    nuevosCircuitos[circuitoIndex].elementos[elementoIndex].existencia_teorica = value;
    setCircuitos(nuevosCircuitos);
  };

  const handleKeyDown = (e, row, col) => {
    const totalRows = circuitos.length;
    const totalCols = nombresElementos.length;
    let newRow = row, newCol = col;

    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); if (row > 0) newRow = row - 1; break;
      case 'ArrowDown': e.preventDefault(); if (row < totalRows - 1) newRow = row + 1; break;
      case 'ArrowLeft': e.preventDefault(); if (col > 0) newCol = col - 1; break;
      case 'ArrowRight': e.preventDefault(); if (col < totalCols - 1) newCol = col + 1; break;
      case 'Enter':
        e.preventDefault();
        if (!e.shiftKey && row < totalRows - 1) newRow = row + 1;
        else if (e.shiftKey && row > 0) newRow = row - 1;
        break;
      case 'Tab':
        e.preventDefault();
        if (!e.shiftKey) {
          if (col < totalCols - 1) newCol = col + 1;
          else if (row < totalRows - 1) { newRow = row + 1; newCol = 0; }
        } else {
          if (col > 0) newCol = col - 1;
          else if (row > 0) { newRow = row - 1; newCol = totalCols - 1; }
        }
        break;
      case 'F2': e.preventDefault(); focusInput(row, col, true); return; // No cambiar celda activa
      default: return; // No hacer nada para otras teclas
    }
    if (newRow !== row || newCol !== col) {
      setActiveCell({ row: newRow, col: newCol });
      focusInput(newRow, newCol);
    }
  };

  const focusInput = (row, col, selectText = false) => {
    if (inputRefs.current[row] && inputRefs.current[row][col]) {
      const input = inputRefs.current[row][col];
      input.focus();
      if (selectText) input.select();
    }
  };

  useEffect(() => {
    if (paso === 4 && inputRefs.current[0] && inputRefs.current[0][0]) {
      // focusInput(activeCell.row, activeCell.col); // Enfocar la celda activa actual
      inputRefs.current[activeCell.row]?.[activeCell.col]?.focus();

    }
  }, [paso]); // No incluir activeCell para evitar re-foco en cada cambio de celda

  useEffect(() => {
    if (paso === 4 && typeof bootstrap !== 'undefined') { // Verificar que bootstrap esté cargado
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }, [paso, circuitos]); // Re-inicializar si cambian los circuitos y se muestran/ocultan botones

  const nextTutorialStep = () => {
    if (tutorialStep < 6) { // Asumiendo 6 pasos en el tutorial
      setTutorialStep(s => s + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'completado');
    }
  };
  const prevTutorialStep = () => setTutorialStep(s => Math.max(s - 1, 1));

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'saltado');
  };

  const handleContextMenu = (e, circuitoIndex, elementoIndex) => {
    e.preventDefault();
    const valor = circuitos[circuitoIndex].elementos[elementoIndex].existencia_teorica;
    if (valor) {
      setCopiado({ circuitoIndex, elementoIndex, valor });
      mostrarTooltip(e, '¡Valor copiado!');
    }
  };

  const handleDoubleClick = (e, circuitoIndex, elementoIndex) => {
    if (copiado) {
      handleCircuitoChange(circuitoIndex, elementoIndex, copiado.valor);
      mostrarTooltip(e, '¡Valor pegado!');
    }
  };

  const mostrarTooltip = (e, mensaje) => {
    const existingTooltip = document.querySelector('.custom-tooltip-ensaye');
    if (existingTooltip) existingTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-ensaye'; // Clase específica
    tooltip.textContent = mensaje;
    document.body.appendChild(tooltip);

    // Posicionamiento mejorado
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;


    setTimeout(() => {
      tooltip.classList.add('fade-out');
      setTimeout(() => tooltip.remove(), 300);
    }, 1000); // Aumentado a 1 segundo
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoCargado(false); // Resetear estado

    Swal.fire({
      title: 'Procesando archivo...',
      text: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        procesarDatosImportados(jsonData); // Esta función ya muestra Swal de éxito/error
      } catch (error) {
        console.error('Error al leer archivo:', error);
        Swal.fire("Error de Lectura", "No se pudo leer el archivo. Asegúrate que sea un Excel válido.", "error");
      }
    };
    reader.onerror = () => {
      Swal.fire("Error de Archivo", "Hubo un error al cargar el archivo.", "error");
    };
    reader.readAsArrayBuffer(file);
  };

  const procesarDatosImportados = (datos) => {
    try {
      if (!datos || datos.length < 1) throw new Error('Archivo vacío o sin datos.');
      const headerRow = datos[0];
      const etapaIndex = headerRow.findIndex(col => String(col).toLowerCase().trim().includes('etapa'));
      const elementosIndices = nombresElementos.map(nombre =>
        headerRow.findIndex(col => String(col).toLowerCase().trim().includes(nombre.toLowerCase().split(' ')[0]))
      );

      if (etapaIndex === -1 || elementosIndices.some(idx => idx === -1)) {
        let missingHeaders = [];
        if (etapaIndex === -1) missingHeaders.push("'Etapa'");
        elementosIndices.forEach((idx, i) => {
          if (idx === -1) missingHeaders.push(`'${nombresElementos[i].split(' ')[0]}'`);
        });
        throw new Error(`Formato de archivo incorrecto. Faltan las siguientes cabeceras: ${missingHeaders.join(', ')}.`);
      }

      const nuevosCircuitos = circuitos.map(c => ({ ...c, elementos: c.elementos.map(e => ({ ...e })) })); // Deep copy

      let datosImportadosCount = 0;
      for (let i = 1; i < datos.length; i++) {
        const row = datos[i];
        if (!row[etapaIndex]) continue;
        const etapaNombre = String(row[etapaIndex]).trim();
        const circuitoIndex = nuevosCircuitos.findIndex(c => c.etapa === etapaNombre);

        if (circuitoIndex !== -1) {
          nombresElementos.forEach((_, idx) => {
            if (elementosIndices[idx] !== -1) { // Asegurarse que el índice del elemento es válido
              const valor = row[elementosIndices[idx]];
              if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
                // Validar si es número antes de asignar
                const numValor = parseFloat(String(valor));
                if (!isNaN(numValor)) {
                  nuevosCircuitos[circuitoIndex].elementos[idx].existencia_teorica = numValor;
                  datosImportadosCount++;
                } else {
                  console.warn(`Valor no numérico omitido para ${etapaNombre}, ${nombresElementos[idx]}: ${valor}`);
                }
              }
            }
          });
        }
      }

      if (datosImportadosCount === 0) {
        Swal.fire("Datos no Encontrados", "No se encontraron datos coincidentes con las etapas y elementos esperados en el archivo.", "warning");
        return;
      }

      setCircuitos(nuevosCircuitos);
      setArchivoCargado(true);
      Swal.fire("¡Datos Cargados!", `${datosImportadosCount} valore(s) importado(s) satisfactoriamente.`, "success");
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      Swal.fire("Error al Procesar", error.message || "Verifique el formato del archivo y que las cabeceras coincidan.", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''; // Limpiar el input de archivo
    }
  };

  const descargarPlantilla = () => {
    const datos = [
      ['Etapa', ...nombresElementos],
      ...circuitos.map(circuito => [
        circuito.etapa,
        ...circuito.elementos.map(el => el.existencia_teorica) // Mantener vacíos si así están
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DatosCircuitos');
    XLSX.writeFile(wb, 'plantilla_ensayes.xlsx');
  };

  const handleShowModal = (e) => {
    e.preventDefault();
    const validacion = validarDatosCompletos();

    if (!validacion.esValido) {
      const errorMessages = validacion.errores.map(err => `<li>${err.mensaje}</li>`).join('');
      Swal.fire({
        title: '<strong class="text-danger">¡Datos Incompletos!</strong>',
        icon: 'error',
        html: `<p class="text-start">Por favor, corrige los siguientes errores:</p>
               <ul class="text-start list-unstyled">${errorMessages}</ul>`,
        confirmButtonText: 'Entendido',
        animation: true,
      });
      // Navegar al primer paso con error
      if (validacion.errores.length > 0) {
        setPaso(validacion.errores[0].pasoAcorregir);
      }
      return;
    }
    setShowConfirmModal(true);
  };

  const registerEssayMutation = useMutation({
    mutationFn: async (newEssay) => {
      const res = await clienteAxios.post('/ensaye', newEssay, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log('Ensaye Registrado', data);
      Swal.fire('¡Guardado!', 'Ensaye registrado correctamente.', 'success');
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.log(error)
      // Manejo de error si la solicitud falla.
      Swal.fire('Error', 'No se pudo guardar el ensaye. Intenta de nuevo.', 'error');
      setIsSubmitting(false);
    },
  });

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    // Variable para almacenar el estado actual del HTML
    let currentHtml = `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.8;">
            <p class="mb-1" id="status-stored"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Enviando datos al servidor...</p>
            <p class="mb-1" id="status-balance"></p>
            <p class="mb-0" id="status-email"></p>
        </div>
    `;

    Swal.fire({
      title: 'Registrando Ensaye...',
      html: currentHtml,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        // Solo mostramos el loading para el estado inicial
        if (swalInstance.isLoading !== undefined) {
          Swal.showLoading();
        }
      }
    });
    // Luego para trabajar correctamente:
    const [y, m, d] = formData.fecha.split('-').map(Number);
    const fechaLocal = new Date(y, m - 1, d);
    const datosEnvio = {
      fecha: fechaLocal.toISOString(),
      tipo_ensaye: `Laboratorio ${tipoLaboratorio}`,
      turno: turno,
      molienda_humeda: parseFloat(formData.molienda_humeda),
      humedad: parseFloat(formData.humedad),
      cabeza_general: parseFloat(formData.cabeza_general),
      circuitos: circuitos.map(circuito => ({
        etapa: circuito.etapa,
        elementos: circuito.elementos.map(elemento => ({
          elemento_id: elemento.elemento_id,
          existencia_teorica: parseFloat(elemento.existencia_teorica) || 0
        }))
      }))
    };

    let balanceCalculationSuccess = null;
    let emailNotificationSuccess = null;
    let emailDetails = '';

    try {
      const response = await clienteAxios.post('/ensaye', datosEnvio, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status !== 201) {
        Swal.fire({
          icon: 'error',
          title: 'Error al Registrar',
          html: response.data.detail || 'No se pudo registrar el ensaye. Intente nuevamente.',
        });
        setIsSubmitting(false);
        return;
      }

      const ensayeIdParaWS = response.data.ensaye_id;

      // Actualizamos el HTML almacenado
      currentHtml = `
            <div style="text-align: left; font-size: 0.9rem; line-height: 1.8;">
                <p class="mb-1" id="status-stored"><i class="fas fa-check-circle text-success me-2"></i>Ensaye almacenado (ID: ${ensayeIdParaWS}).</p>
                <p class="mb-1" id="status-balance"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Calculando balance...</p>
                <p class="mb-0" id="status-email" style="visibility: hidden;"><span class="spinner-border spinner-border-sm text-secondary me-2" role="status"></span>Enviando notificación por correo...</p>
            </div>
        `;

      Swal.update({
        title: '¡Ensaye Registrado!',
        html: currentHtml,
        icon: 'success',
        showConfirmButton: false,
      });

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsURL = `${wsProtocol}//localhost:8000/ensaye/ws/status/${ensayeIdParaWS}`;
      const socket = new WebSocket(wsURL);

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Mensaje WebSocket:', message);

          // Función para actualizar el HTML según el evento
          const updateStatus = (eventType) => {
            switch (eventType) {
              case 'balance_calculation_finished':
                balanceCalculationSuccess = message.status === 'success';
                currentHtml = currentHtml.replace(
                  /<p class="mb-1" id="status-balance">.*?<\/p>/,
                  `<p class="mb-1" id="status-balance">${balanceCalculationSuccess
                    ? `<i class="fas fa-check-circle text-success me-2"></i>${message.details || 'Cálculo de balance completado.'}`
                    : `<i class="fas fa-times-circle text-danger me-2"></i>${message.details || 'Error en cálculo de balance.'}`}</p>`
                );
                currentHtml = currentHtml.replace(
                  /<p class="mb-0" id="status-email".*?<\/p>/,
                  `<p class="mb-0" id="status-email" style="visibility: visible;"><span class="spinner-border spinner-border-sm text-secondary me-2" role="status"></span>Enviando notificación por correo...</p>`
                );
                break;

              case 'email_notification_sent':
                emailNotificationSuccess = message.status === 'success';
                emailDetails = message.details || (message.status === 'skipped' ? 'Envío de correo omitido.' : '');
                currentHtml = currentHtml.replace(
                  /<p class="mb-0" id="status-email".*?<\/p>/,
                  `<p class="mb-0" id="status-email">${emailNotificationSuccess
                    ? `<i class="fas fa-check-circle text-success me-2"></i>${emailDetails}`
                    : `<i class="fas fa-times-circle text-danger me-2"></i>${emailDetails}`}</p>`
                );
                break;

              case 'background_task_error':
                balanceCalculationSuccess = false;
                emailNotificationSuccess = false;
                currentHtml = currentHtml.replace(
                  /<p class="mb-1" id="status-balance">.*?<\/p>/,
                  `<p class="mb-1" id="status-balance"><i class="fas fa-exclamation-triangle text-danger me-2"></i>${message.details || 'Error en proceso de fondo.'}</p>`
                );
                currentHtml = currentHtml.replace(
                  /<p class="mb-0" id="status-email".*?<\/p>/,
                  `<p class="mb-0" id="status-email"><i class="fas fa-exclamation-triangle text-danger me-2"></i>Notificación por correo no procesada.</p>`
                );
                break;
            }
          };

          // Actualizamos según el tipo de evento
          updateStatus(message.event);

          // Verificamos si todas las tareas están completadas
          const tareasCompletadas = message.event === 'email_notification_sent' ||
            message.event === 'background_task_error';

          if (tareasCompletadas) {
            let finalTitle = '¡Proceso Finalizado!';
            let finalIcon = 'success';

            if (balanceCalculationSuccess === true && emailNotificationSuccess === true) {
              finalTitle = '¡Todas las tareas completadas exitosamente!';
            } else if (balanceCalculationSuccess === false) {
              finalTitle = 'Error en el Procesamiento del Ensaye';
              finalIcon = 'error';
            } else if (emailNotificationSuccess === false) {
              finalTitle = 'Ensaye Procesado con Errores de Notificación';
              finalIcon = 'warning';
            }

            


            // Actualizamos el Swal manteniendo el HTML actualizado
            Swal.update({
              title: finalTitle,
              html: currentHtml,
              icon: finalIcon,
              showConfirmButton: true,
              confirmButtonText: 'Listo',
            });
            
            socket.close();

            navigate('/ensaye');
          }
        } catch (e) {
          console.error("Error al procesar mensaje WebSocket:", e);
          Swal.fire({
            title: 'Error de Comunicación',
            text: 'Hubo un problema al recibir actualizaciones de estado.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          socket.close();
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        currentHtml = currentHtml.replace(
          /<p class="mb-1" id="status-balance">.*?<\/p>/,
          `<p class="mb-1" id="status-balance"><i class="fas fa-exclamation-triangle text-warning me-2"></i>No se pudo conectar para verificar el estado del balance.</p>`
        );

        Swal.update({
          title: 'Error de Conexión',
          html: currentHtml,
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonText: 'Entendido'
        });
      };

      socket.onclose = (event) => {
        console.log('WebSocket cerrado:', event.code, event.reason);
      };

    } catch (error) {
      console.error("Error al registrar el ensaye:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: 'No se pudo registrar el ensaye. Intenta nuevamente.',
      });
      setIsSubmitting(false);
    }
  };

  const TutorialModalComponent = ({ step, onNext, onPrev, onSkip }) => { // Renombrado para evitar conflicto de nombre
    const steps = [
      { title: "Bienvenido al Editor de Tablas", content: "Te guiaremos por las funciones principales para llenar datos eficientemente.", position: "center", highlight: true },
      { title: "Importar desde Excel", content: "Usa 'Seleccionar archivo' para cargar datos. Si es tu primera vez, descarga la plantilla.", position: "center", target: ".import-section", highlight: "#importar-archivo" },
      { title: "Navegación con Teclado", content: "Usa flechas para moverte. Tab/Shift+Tab horizontalmente, Enter/Shift+Enter verticalmente.", position: "center", highlight: "#ensaye-table" },
      { title: "Copiar y Pegar", content: "Clic derecho en una celda para copiar. Doble clic en otra para pegar.", position: "center", highlight: "#ensaye-table" },
      { title: "Edición Rápida", content: "Clic en una celda para editar o presiona F2. Enter para guardar cambios (implícito).", position: "center", highlight: "#ensaye-table" },
      { title: "Guardar los Datos", content: "Al terminar, clic en 'Guardar Ensaye' para registrar la información.", position: "center", highlight: "#saveButton" }
    ];
    const currentStepData = steps[step - 1] || steps[0];

    const getHighlightPosition = (selector) => {
      if (!selector || selector === true) return {}; // Para el highlight general
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, left: rect.left, width: rect.width, height: rect.height, position: 'fixed' };
      }
      return {};
    };
    const getStepPosition = (s) => {
      if (s.target) {
        const element = document.querySelector(s.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (s.position === 'top') return { bottom: `${window.innerHeight - rect.top + 10}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)', position: 'fixed' };
          return { top: `${rect.bottom + 10}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)', position: 'fixed' };
        }
      }
      // Default to center if target not found or not specified for positioning
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' };
    };

    if (!currentStepData) return null;

    return (
      <div className="tutorial-overlay-ensaye">
        {currentStepData.highlight && (
          <div className="tutorial-highlight-ensaye" style={getHighlightPosition(currentStepData.highlight)} />
        )}
        <div className="tutorial-step-ensaye" ref={tutorialRef} style={getStepPosition(currentStepData)}>
          <h5 className="fw-bold text-primary mb-3">{currentStepData.title}</h5>
          <p style={{ fontSize: '0.9rem' }}>{currentStepData.content}</p>
          <div className="d-flex justify-content-between mt-4">
            <div>{step > 1 && (<Button variant="outline-secondary" size="sm" onClick={onPrev}>Anterior</Button>)}</div>
            <div>
              <Button variant="outline-secondary" size="sm" onClick={onSkip} className="me-2">Saltar Tutorial</Button>
              <Button variant="primary" size="sm" onClick={onNext}>
                {step === steps.length ? 'Finalizar' : 'Siguiente'}
              </Button>
            </div>
          </div>
          <div className="text-center mt-2"><small>Paso {step} de {steps.length}</small></div>
        </div>
      </div>
    );
  };

  const cardBaseStyle = { transition: 'all 0.2s ease-in-out', cursor: 'pointer', height: '100%' };
  const cardHoverStyle = { transform: 'translateY(-4px)', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' };
  const cardSelectedStyle = (color = '#0d6efd', bgColor = 'rgba(13, 110, 253, 0.05)') => ({
    borderColor: color + ' !important',
    backgroundColor: bgColor,
    transform: 'translateY(-4px)',
    boxShadow: `0 0 0 0.2rem ${color}33`
  });

  const totalPasos = 4;

  return (
    <div className="container py-4" style={{ maxWidth: '100%' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className='text-center fw-bold mb-0 h2'>Registrar Nuevo Ensaye</h1>
        <Link to="/ensaye" className="btn btn-sm btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i> Volver al Dashboard
        </Link>
      </div>

      <div className="progress mb-4" style={{ height: '10px', borderRadius: '5px' }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${(paso / totalPasos) * 100}%`, transition: 'width 0.3s ease-in-out' }}
          aria-valuenow={paso} aria-valuemin="1" aria-valuemax={totalPasos}
        />
      </div>

      <div className="card shadow-sm rounded-3 border-0">
        <div className="card-body p-4 p-md-5">
          {/* Paso 1: Selección de Turno */}
          <div style={{ display: paso === 1 ? 'block' : 'none', animation: paso === 1 ? 'fadeIn 0.5s ease' : '' }}>
            <h3 className="fw-bold text-center mb-4 text-primary"><span className="badge bg-primary me-2">1</span>Selecciona el Turno</h3>
            <div className="row g-3 justify-content-center">
              {[1, 2].map((t) => (
                <div className="col-md-5" key={t}>
                  <div
                    className={`card text-center h-100 border-2 ${turno === t ? '' : 'border-light'}`}
                    style={{ ...cardBaseStyle, ...(turno === t ? cardSelectedStyle() : {}) }}
                    onMouseEnter={(e) => { if (turno !== t) e.currentTarget.style.transform = cardHoverStyle.transform; e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow; }}
                    onMouseLeave={(e) => { if (turno !== t) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => { setTurno(t); avanzarPaso(); }}
                  >
                    <div className="card-body d-flex flex-column justify-content-center p-4">
                      <i className={`fas ${t === 1 ? 'fa-sun' : 'fa-moon'} fa-2x mb-2 ${turno === t ? 'text-primary' : 'text-muted'}`}></i>
                      <h4 className="fw-semibold mb-0">TURNO {t}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paso 2: Tipo de laboratorio */}
          <div style={{ display: paso === 2 ? 'block' : 'none', animation: paso === 2 ? 'fadeIn 0.5s ease' : '' }}>
            <h3 className="fw-bold text-center mb-4 text-primary"><span className="badge bg-primary me-2">2</span>Tipo de Laboratorio</h3>
            <div className="row g-3 justify-content-center">
              {['Conciliado', 'Real'].map((tipo) => (
                <div className="col-md-5" key={tipo}>
                  <div
                    className={`card text-center h-100 border-2 ${tipoLaboratorio === tipo ? '' : 'border-light'}`}
                    style={{ ...cardBaseStyle, ...(tipoLaboratorio === tipo ? cardSelectedStyle('#0dcaf0', 'rgba(13, 202, 240, 0.05)') : {}) }}
                    onMouseEnter={(e) => { if (tipoLaboratorio !== tipo) e.currentTarget.style.transform = cardHoverStyle.transform; e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow; }}
                    onMouseLeave={(e) => { if (tipoLaboratorio !== tipo) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => { setTipoLaboratorio(tipo); avanzarPaso(); }}
                  >
                    <div className="card-body d-flex flex-column justify-content-center p-4">
                      <i className={`fas ${tipo === 'Conciliado' ? 'fa-tasks' : 'fa-flask'} fa-2x mb-2 ${tipoLaboratorio === tipo ? 'text-info' : 'text-muted'}`}></i>
                      <h4 className="fw-semibold mb-0">{tipo}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Button variant="outline-secondary" onClick={volverPaso}><i className="fas fa-arrow-left me-2"></i>Paso Anterior</Button>
            </div>
          </div>

          {/* Paso 3: Datos técnicos */}
          <div style={{ display: paso === 3 ? 'block' : 'none', animation: paso === 3 ? 'fadeIn 0.5s ease' : '' }}>
            <h3 className="fw-bold text-center mb-4 text-primary"><span className="badge bg-primary me-2">3</span>Datos Técnicos del Ensaye</h3>
            <p className="text-center text-muted mb-4"><small>Los campos marcados con <span className="text-danger">*</span> son obligatorios.</small></p>
            <div className="row g-3">
              {[{ name: 'molienda_humeda', label: 'Molienda Húmeda (t/d)', placeholder: 'Ej: 2041.32', type: 'number', step: "0.01" },
              { name: 'humedad', label: 'Humedad (%)', placeholder: 'Ej: 3.0', type: 'number', step: "0.1", max: "100" },
              { name: 'cabeza_general', label: 'Cabeza General (g/t)', placeholder: 'Ej: 1.50', type: 'number', step: "0.01" }
              ].map(field => (
                <div className="col-md-4" key={field.name}>
                  <label className="form-label fw-semibold">{field.label} <span className="text-danger">*</span></label>
                  <input type={field.type} className={`form-control form-control-lg ${!formData[field.name] ? 'is-invalid-custom' : ''}`}
                    placeholder={field.placeholder} name={field.name} value={formData[field.name]} onChange={handleInputChange}
                    step={field.step} min="0" max={field.max || undefined} required />
                </div>
              ))}
              <div className="col-md-12"> {/* Fecha ocupa todo el ancho para mejor layout en algunos casos */}
                <label className="form-label fw-semibold">Fecha <span className="text-danger">*</span></label>
                <input type="date" className="form-control form-control-lg" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="d-flex justify-content-between mt-5">
              <Button variant="outline-secondary" onClick={volverPaso}><i className="fas fa-arrow-left me-2"></i>Paso Anterior</Button>
              <Button variant="primary" onClick={avanzarPaso} disabled={!formData.molienda_humeda || !formData.humedad || !formData.cabeza_general}>
                Siguiente <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </div>
          </div>

          {/* Paso 4: Circuitos y elementos */}
          <div style={{ display: paso === 4 ? 'block' : 'none', animation: paso === 4 ? 'fadeIn 0.5s ease' : '' }}>
            <h3 className="fw-bold text-center mb-4 text-primary"><span className="badge bg-primary me-2">4</span>Datos de Circuitos y Elementos</h3>
            <div className="card mb-4 border-primary-subtle import-section">
              <div className="card-body" id='importar-archivo'>
                <h5 className="fw-bold mb-3 text-primary">Importar Datos desde Excel</h5>
                <div className="row align-items-center g-2">
                  <div className="col-md-7 mb-2 mb-md-0">
                    <div className="input-group">
                      <input type="file" className="form-control" accept=".xlsx,.xls,.csv" onChange={handleFileImport} ref={fileInputRef} />
                      <Button variant="outline-secondary" onClick={() => { fileInputRef.current.value = ''; setArchivoCargado(false); }}>Limpiar</Button>
                    </div>
                    <small className="form-text text-muted">Formatos: .xlsx, .xls, .csv</small>
                  </div>
                  <div className="col-md-5 text-md-end">
                    <Button variant="outline-info" onClick={descargarPlantilla}>
                      <i className="fas fa-file-download me-2"></i>Descargar Plantilla
                    </Button>
                  </div>
                </div>
                {archivoCargado && (
                  <div className="alert alert-success mt-3 mb-0 py-2">
                    <i className="fas fa-check-circle me-2"></i>
                    Archivo procesado. Verifique los datos en la tabla.
                  </div>
                )}
              </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="table table-bordered table-hover text-center" id="ensaye-table">
                <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '20%' }}>Etapa</th>
                    {nombresElementos.map((nombre, index) => (
                      <th key={index} style={{ width: `${80 / nombresElementos.length}%`, minWidth: '100px' }}>{nombre}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {circuitos.map((circuito, circuitoIndex) => (
                    <tr key={circuitoIndex}>
                      <td className="fw-semibold align-middle bg-light-subtle">{circuito.etapa}</td>
                      {circuito.elementos.map((elemento, elementoIndex) => (
                        <td key={elementoIndex} className={`p-0 position-relative ${activeCell.row === circuitoIndex && activeCell.col === elementoIndex ? 'cell-active' : ''}`}
                          tabIndex={-1} // Quitar tabIndex de la celda, manejar foco solo en input
                          onKeyDown={(e) => handleKeyDown(e, circuitoIndex, elementoIndex)}
                        >
                          <div className="d-flex align-items-stretch h-100 d-flex justify-content-center  mt-2"> {/* Asegurar que el div ocupe toda la celda */}
                            <input
                              type="number"
                              className={`form-control-table ${elemento.existencia_teorica === '' || elemento.existencia_teorica === null ? 'input-empty' : ''}`}
                              value={elemento.existencia_teorica}
                              onChange={(e) => handleCircuitoChange(circuitoIndex, elementoIndex, e.target.value)}
                              onContextMenu={(e) => handleContextMenu(e, circuitoIndex, elementoIndex)}
                              onDoubleClick={(e) => handleDoubleClick(e, circuitoIndex, elementoIndex)}
                              onFocus={(e) => { e.target.select(); setActiveCell({ row: circuitoIndex, col: elementoIndex }); }}
                              step="0.001" min="0" placeholder="0.00"
                              ref={(el) => {
                                if (!inputRefs.current[circuitoIndex]) inputRefs.current[circuitoIndex] = [];
                                inputRefs.current[circuitoIndex][elementoIndex] = el;
                              }}
                            />
                            {elemento.existencia_teorica !== '' && elemento.existencia_teorica !== null && (
                              <Button variant="link" className="btn-clear-cell text-danger p-0 px-0"
                                onClick={() => handleCircuitoChange(circuitoIndex, elementoIndex, '')}
                                title="Limpiar celda">
                                <i className="fas fa-times-circle"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-4 save-section">
              <Button variant="outline-secondary" onClick={volverPaso} disabled={isSubmitting}><i className="fas fa-arrow-left me-2"></i>Paso Anterior</Button>
              <Button id='saveButton' variant="success" onClick={handleShowModal}
                disabled={isSubmitting || !validarDatosCompletos().esValido}
                title={!validarDatosCompletos().esValido ? "Complete todos los campos requeridos para guardar." : "Guardar Ensaye"}>
                <i className="fas fa-save me-2"></i>{isSubmitting ? 'Guardando...' : 'Guardar Ensaye'}
              </Button>
            </div>
            {showTutorial && <TutorialModalComponent step={tutorialStep} onNext={nextTutorialStep} onPrev={prevTutorialStep} onSkip={skipTutorial} />}
          </div>
        </div>
      </div>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} fullscreen centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className='text-white'>
            <i className="fas fa-check-circle me-2"></i>Confirmar Datos del Ensaye
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          {/* Información general */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Resumen de Información General</h5>
              <div className="row">
                <div className="col-md-4 mb-2"><strong>Turno:</strong> {turno}</div>
                <div className="col-md-4 mb-2"><strong>Tipo Lab.:</strong> {tipoLaboratorio}</div>
                <div className="col-md-4 mb-2"><strong>Fecha:</strong> {new Date(formData.fecha + 'T00:00:00').toLocaleDateString()}</div>
              </div>
              <div className="row mt-2">
                <div className="col-md-4 mb-2"><strong>Molienda Húmeda:</strong> {formData.molienda_humeda} t/d</div>
                <div className="col-md-4 mb-2"><strong>Humedad:</strong> {formData.humedad}%</div>
                <div className="col-md-4 mb-2"><strong>Cabeza General:</strong> {formData.cabeza_general} g/t</div>
              </div>
            </div>
          </div>

          {/* Tabla de circuitos */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Resumen de Datos de Circuitos</h5>
              <div className="table-responsive" style={{ maxHeight: '600px' }}>
                <table className="table table-bordered table-hover text-center align-middle">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th>Etapa</th>
                      {nombresElementos.map(n => (
                        <th key={n}>{n}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {circuitos.map(c => (
                      <tr key={c.etapa}>
                        <td className="fw-semibold">{c.etapa}</td>
                        {c.elementos.map(el => (
                          <td key={el.elemento_id}>{el.existencia_teorica || '0'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
            <i className="fas fa-edit me-2"></i>Volver a Editar
          </Button>
          <Button variant="success" onClick={confirmSubmit} disabled={isSubmitting}>
            <i className="fas fa-check-circle me-2"></i>
            {isSubmitting ? 'Procesando...' : 'Confirmar y Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .form-control, .form-select, .btn { border-radius: 0.375rem; /* Bootstrap's default */ }
        .form-control:focus, .form-select:focus { border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
        .progress-bar { background-color: #0d6efd; }
        
        // Estilos para la tabla de circuitos
        /* Estilos mejorados para la tabla de ensaye */
        /* Estilos para la tabla de circuitos - VERSIÓN "SOFT CHIPS" */

        /* Estilo para el contenedor flex dentro de cada celda (td) */
        #ensaye-table td > div.d-flex {
          padding: 5px 3px;         /* Espacio alrededor de los "chips" dentro de la celda */
          align-items: center;      /* Centrar verticalmente el chip y el botón */
          justify-content: center;  /* Centrar horizontalmente el chip y el botón */
          /* height: 100%; */      /* Descomentar si las celdas tienen altura fija y se desea centrado vertical perfecto */
        }

        .form-control-table {
          /* El ancho se ajustará por el contenido y el padding, o podrías darle un min/max-width */
          /* width: auto; */ /* Para que se ajuste al contenido, o usa flex-grow:1 si quieres que llene espacio */
          flex-grow: 1;             /* Permitir que el input crezca para llenar el espacio disponible en el flex container */
          max-width: 130px;         /* Limitar el ancho máximo para mantener la apariencia de "chip" */
          min-width: 60px;          /* Un ancho mínimo para que no sea demasiado pequeño */
          
          border: 1px solid #dce4ec; /* Un borde gris azulado muy suave */
          border-radius: 20px;       /* Bordes muy redondeados, estilo "pill" o "chip" */
          padding: 7px 10px;         /* Padding para dar espacio interno y definir la altura */
          text-align: center;
          background-color: #f8faff; /* Un fondo casi blanco con un ligero tinte azulado/frío */
          color: #4B5563;            /* Un color de texto gris oscuro, legible */
          font-size: 0.875rem;       /* Tamaño de fuente ligeramente reducido para el estilo "chip" */
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); /* Sombra muy sutil para un ligero efecto de elevación */
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); /* Transición más vivaz */
          appearance: textfield;     /* Ocultar spinners por defecto en inputs numéricos */
          height: auto;              /* La altura se define por el padding y el contenido */
        }

        /* Ocultar spinners en Webkit (Chrome, Safari, Edge) */
        .form-control-table::-webkit-outer-spin-button,
        .form-control-table::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Ocultar spinners en Firefox */
        .form-control-table[type=number] {
          -moz-appearance: textfield;
        }

        .form-control-table:hover {
          border-color: #b3c5d9;
          background-color: #ffffff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.07);
        }

        .form-control-table:focus {
          outline: none;
          border-color: #FF7043; /* Un naranja coral amigable y cálido para el foco */
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 112, 67, 0.2), /* Resplandor coral */
                      0 2px 6px rgba(0, 0, 0, 0.1);  /* Sombra un poco más pronunciada */
          position: relative;
          z-index: 1;
          /* transform: translateY(-1px); /* Opcional: ligero levantamiento al enfocar */
        }

        .form-control-table.input-empty {
          background-color: #f0f4f8; /* Un gris azulado muy claro para campos vacíos */
          border-color: #d1d9e2;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.03); /* Ligera sombra interior para indicar "vacío" */
        }
        .form-control-table.input-empty::placeholder {
          color: #7D8DA1; /* Un color de placeholder más notable y ligeramente azulado */
        }

        .form-control-table.input-empty:focus {
          /* Mantiene el estilo de foco estándar cuando se interactúa */
          border-color: #FF7043;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 112, 67, 0.2),
                      0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .form-control-table::placeholder {
          color: #A0AEC0; /* Un gris claro y suave para el placeholder */
          font-style: normal;
          font-size: 0.8rem;
        }

        /* Botón de limpiar celda - estilo "chip" circular */
        .btn-clear-cell {
          visibility: hidden;
          opacity: 0;
          transition: all 0.2s ease-in-out;
          color: #A0AEC0;               /* Color gris claro para el icono */
          background-color: #f0f4f8;    /* Fondo que combine con el input vacío */
          border: 1px solid #d1d9e2;    /* Borde sutil */
          border-radius: 50%;           /* Botón perfectamente circular */
          width: 22px;                  /* Tamaño fijo para el círculo */
          height: 22px;
          font-size: 0.7rem;            /* Tamaño del icono (la X) */
          line-height: 20px;            /* Para centrar el icono verticalmente */
          text-align: center;
          cursor: pointer;
          margin-left: 6px;             /* Espacio entre el input y el botón */
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .btn-clear-cell:hover {
          color: #FF7043;               /* Color coral al pasar el mouse */
          background-color: #fff1eb;    /* Un fondo color coral muy pálido */
          border-color: #ffc9b8;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        /* Muestra el botón de limpiar */
        #ensaye-table td:hover .btn-clear-cell,
        #ensaye-table td:focus-within .btn-clear-cell {
          visibility: visible;
          opacity: 1;
        }

        .is-invalid-custom { border-color: var(--bs-danger); }
        .is-invalid-custom:focus { border-color: var(--bs-danger); box-shadow: 0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25); }

        // Tooltip personalizado para copiar/pegar
        .custom-tooltip-ensaye { background-color: #333; color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; pointer-events: none; z-index: 2000; opacity: 1; transition: opacity 0.3s ease; position: absolute; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .custom-tooltip-ensaye.fade-out { opacity: 0; }

        // Estilos del Tutorial
        .tutorial-overlay-ensaye { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1045; }
        .tutorial-highlight-ensaye { border: 3px solid #0d6efd; border-radius: 5px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); z-index: 1048; pointer-events: none; transition: all 0.3s ease-in-out; }
        .tutorial-step-ensaye { background-color: white; border-radius: 8px; padding: 20px; max-width: 380px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1050; pointer-events: auto; border-top: 4px solid #0d6efd;}
      `}</style>
    </div>
  );
};