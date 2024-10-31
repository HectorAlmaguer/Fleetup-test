import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "./app.js";

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../index.html";
    } else {
      await initializePage(user);
    }
  });

  const uploadBtn = document.getElementById("upload-btn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("file-upload");
      const file = fileInput.files[0];
      if (file) {
        if (file.type.includes("excel") || file.type.includes("spreadsheetml")) {
          processExcel(file);
        } else {
          Swal.fire("Error", "Por favor seleccione un archivo Excel válido.", "error");
        }
      }
    });
  }

  const submitOrderBtn = document.getElementById("submit-order");
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", saveOrder);
  }
});

// Función para inicializar la página
async function initializePage(user) {
  try {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      configureNavbarOptions(docSnap.data().area);
      displayUserDetails(user.displayName, user.email);
      await generateOrderFolio(); // Generar el folio al cargar la página
    } else {
      console.log("Usuario no encontrado en Firestore.");
      await auth.signOut();
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Error inicializando la página:", error);
  }
}

// Genera un folio único para la orden de venta y lo asigna al campo de folio
async function generateOrderFolio() {
  const ordersSnapshot = await getDocs(collection(db, "ordenes"));
  const orderCount = ordersSnapshot.size + 1;
  const formattedCount = orderCount.toString().padStart(5, "0");
  const folioField = document.getElementById("folio-solicitud");
  if (folioField) folioField.value = `FUOC-${formattedCount}`;
}

// Función para procesar el archivo Excel y agregar los datos a la tabla
function processExcel(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Limpiar la tabla antes de llenarla con nuevos datos
    const tableBody = document.getElementById("vehicle-table-body");
    tableBody.innerHTML = "";

    // Suponiendo que la primera fila contiene encabezados y las siguientes contienen datos
    rows.slice(1).forEach((row) => {
      const [economico, marca, modelo, anio, vin, tipoEquipo, arnesConfig, protocolo, transmision] = row;

      const newRow = tableBody.insertRow();
      newRow.insertCell(0).textContent = economico;
      newRow.insertCell(1).textContent = marca;
      newRow.insertCell(2).textContent = modelo;
      newRow.insertCell(3).textContent = anio;
      newRow.insertCell(4).textContent = vin;
      newRow.insertCell(5).textContent = tipoEquipo;
      newRow.insertCell(6).textContent = arnesConfig;
      newRow.insertCell(7).textContent = protocolo;
      newRow.insertCell(8).textContent = transmision;
    });
  };
  reader.readAsArrayBuffer(file);
}

// Muestra el nombre y correo del usuario
function displayUserDetails(displayName, email) {
  const userNameInput = document.getElementById("user-name");
  const userEmailInput = document.getElementById("user-email");

  if (userNameInput) userNameInput.value = displayName || "Usuario";
  if (userEmailInput) userEmailInput.value = email || "Correo no disponible";
}

// Configura la visibilidad de la navbar
function configureNavbarOptions(area) {
  const options = {
    almacen: ["consultar-ids-nav", "almacen-actividades-nav"],
    sac: ["sac-micuenta-nav"],
    it: [
      "consultar-ids-nav",
      "almacen-actividades-nav",
      "register-tecnicos",
      "sac-micuenta-nav",
    ],
  };
  Object.keys(options).forEach((opt) => {
    options[opt].forEach((id) => {
      const elem = document.getElementById(id);
      if (elem) elem.style.display = "none";
    });
  });
  if (options[area]) {
    options[area].forEach((id) => {
      const elem = document.getElementById(id);
      if (elem) elem.style.display = "block";
    });
  }
}

// Guarda los datos de la tabla en Firestore
async function saveOrder(e) {
  e.preventDefault();
  try {
    const orderData = {
      folio: document.getElementById("folio-solicitud").value,
      fecha: document.getElementById("fecha-solicitud").value,
      dispositivos: [
        ...document.querySelectorAll("#vehicle-table-body tr"),
      ].map((row) => {
        return {
          economico: row.cells[0].textContent,
          marca: row.cells[1].textContent,
          modelo: row.cells[2].textContent,
          anio: row.cells[3].textContent,
          vin: row.cells[4].textContent,
          tipoEquipo: row.cells[5].textContent,
          arnesConfig: row.cells[6].textContent,
          protocolo: row.cells[7].textContent,
          transmision: row.cells[8].textContent,
        };
      }),
    };

    await addDoc(collection(db, "ordenes"), orderData);
    Swal.fire("Éxito", "Orden de venta guardada exitosamente", "success");
  } catch (error) {
    Swal.fire("Error", "No se pudo guardar la orden", "error");
  }
}
