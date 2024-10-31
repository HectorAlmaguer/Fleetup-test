import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "./app.js"; // Asegúrate de que `app.js` exporte `app`

// Inicializa Firebase con los módulos importados
const auth = getAuth(app);
const db = getFirestore(app);

// Manejo del estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Muestra los datos del usuario en el formulario
    document.getElementById("user-name").value = user.displayName;

    try {
      // Obtén datos del usuario desde Firestore
      const uid = user.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const area = userData.area || "";
        const nombre = userData.nombre || "";

        configureNavbar(area);

        if (window.location.pathname === "/index.html") {
          window.location.href = "../pages/opciones.html";
        }
      } else {
        Swal.fire("Error", "Usuario no encontrado en Firestore. Cerrando sesión.", "error");
        await auth.signOut();
        window.location.href = "../index.html";
      }
    } catch (error) {
    }
  } else {
    // Si no está autenticado, redirige al login
    Swal.fire("No autenticado", "Redirigiendo al login.", "info");
    if (window.location.pathname !== "/index.html") {
      window.location.href = "../index.html";
    }
  }
});

// Función para configurar la navbar según el área del usuario
function configureNavbar(area) {
  const consultarIDsNav = document.getElementById("consultar-ids-nav");
  const registerTecnicosNav = document.getElementById("register-tecnicos");
  const sacMicuentaNav = document.getElementById("sac-micuenta-nav");
  const almacenActividadesNav = document.getElementById("almacen-actividades-nav");

  // Oculta todos los elementos al inicio
  if (consultarIDsNav) consultarIDsNav.style.display = "none";
  if (registerTecnicosNav) registerTecnicosNav.style.display = "none";
  if (sacMicuentaNav) sacMicuentaNav.style.display = "none";
  if (almacenActividadesNav) almacenActividadesNav.style.display = "none";

  // Configura la visibilidad de acuerdo al área
  if (area === "almacen") {
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
  }

  if (area === "sac") {
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }

  if (area === "it") {
    // IT tiene acceso a todas las opciones
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
    if (registerTecnicosNav) registerTecnicosNav.style.display = "block";
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registros = [
    { cuentaCliente: 'Cliente1', idDispositivo: 'ID001', sim: 'SIM001' },
    { cuentaCliente: 'Cliente2', idDispositivo: 'ID002', sim: 'SIM002' },
    { cuentaCliente: 'Cliente3', idDispositivo: 'ID003', sim: 'SIM003' },
    { cuentaCliente: 'Cliente1', idDispositivo: 'ID004', sim: 'SIM004' },
    { cuentaCliente: 'Cliente2', idDispositivo: 'ID005', sim: 'SIM005' },
    { cuentaCliente: 'Cliente3', idDispositivo: 'ID006', sim: 'SIM006' },
    // Agrega más registros según sea necesario
  ];

  const tablaBody = document.getElementById('tabla-ids-body');
  const filtroCuentaCliente = document.getElementById('filtro-cuenta-cliente');
  const filtroIdDispositivo = document.getElementById('filtro-id-dispositivo');
  const btnFiltrar = document.getElementById('btn-filtrar');
  const btnDescargarPDF = document.getElementById('btn-descargar-pdf');
  const btnDescargarExcel = document.getElementById('btn-descargar-excel');

  const clientes = [...new Set(registros.map(registro => registro.cuentaCliente))];

  const llenarFiltroClientes = () => {
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente;
      option.textContent = cliente;
      filtroCuentaCliente.appendChild(option);
    });
  };

  const mostrarRegistros = (registrosFiltrados) => {
    tablaBody.innerHTML = '';
    registrosFiltrados.forEach((registro) => {
      const fila = document.createElement('tr');
      const celdaCuentaCliente = document.createElement('td');
      const celdaIdDispositivo = document.createElement('td');
      const celdaSim = document.createElement('td');

      celdaCuentaCliente.textContent = registro.cuentaCliente;
      celdaIdDispositivo.textContent = registro.idDispositivo;
      celdaSim.textContent = registro.sim;

      fila.appendChild(celdaCuentaCliente);
      fila.appendChild(celdaIdDispositivo);
      fila.appendChild(celdaSim);
      tablaBody.appendChild(fila);
    });
  };

  const filtrarRegistros = () => {
    const cuentaCliente = filtroCuentaCliente.value.toLowerCase();
    const idDispositivo = filtroIdDispositivo.value.toLowerCase();

    const registrosFiltrados = registros.filter((registro) => {
      return (
        (cuentaCliente === '' || registro.cuentaCliente.toLowerCase().includes(cuentaCliente)) &&
        (idDispositivo === '' || registro.idDispositivo.toLowerCase().includes(idDispositivo))
      );
    });

    mostrarRegistros(registrosFiltrados);
  };

  const descargarPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Listado de Dispositivos", 20, 10);

    let y = 20;
    const groupedRecords = registros.reduce((acc, registro) => {
      (acc[registro.cuentaCliente] = acc[registro.cuentaCliente] || []).push(registro);
      return acc;
    }, {});

    Object.keys(groupedRecords).forEach(cliente => {
      doc.text(`Cuenta Cliente: ${cliente}`, 20, y);
      y += 10;

      const registrosCliente = groupedRecords[cliente].map(registro => [registro.idDispositivo, registro.sim]);
      doc.autoTable({
        startY: y,
        head: [['ID del Dispositivo', 'SIM']],
        body: registrosCliente,
        theme: 'grid',
        styles: { cellPadding: 2, fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 10 }
      });

      y = doc.lastAutoTable.finalY + 10; // Espacio adicional entre clientes
    });

    doc.save("listado_dispositivos.pdf");
  };

  const descargarExcel = () => {
    const wb = XLSX.utils.book_new();
    const groupedRecords = registros.reduce((acc, registro) => {
      (acc[registro.cuentaCliente] = acc[registro.cuentaCliente] || []).push(registro);
      return acc;
    }, {});

    Object.keys(groupedRecords).forEach(cliente => {
      const ws_data = [
        ["ID del Dispositivo", "SIM"],
        ...groupedRecords[cliente].map(registro => [registro.idDispositivo, registro.sim])
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, cliente);
    });

    XLSX.writeFile(wb, "listado_dispositivos.xlsx");
  };

  btnFiltrar.addEventListener('click', filtrarRegistros);
  btnDescargarPDF.addEventListener('click', descargarPDF);
  btnDescargarExcel.addEventListener('click', descargarExcel);

  // Actualizar la tabla al cambiar la selección de cuenta cliente
  filtroCuentaCliente.addEventListener('change', filtrarRegistros);

  // Llenar opciones del filtro de clientes
  llenarFiltroClientes();

  // Muestra todos los registros al inicio
  mostrarRegistros(registros);
});
