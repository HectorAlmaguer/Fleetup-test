import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "./app.js"; // Asegúrate de que `app.js` exporte `app`

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
});

// Función para inicializar el contenido de la página
async function initializePage(user) {
  try {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const area = userData.area || "";

      configureNavbarOptions(area);
      displayUserDetails(user.displayName, user.email);
      setupEventListeners();
    } else {
      console.log("Usuario no encontrado en Firestore. Cerrando sesión.");
      await auth.signOut();
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
  }
}

function displayUserDetails(displayName, email) {
  const userNameInput = document.getElementById("user-name");
  const userEmailInput = document.getElementById("user-email");

  if (userNameInput) {
    userNameInput.value = displayName || "Usuario";
  }
  if (userEmailInput) {
    userEmailInput.value = email || "Correo no disponible";
  }
}

function configureNavbarOptions(area) {
  const consultarIDsNav = document.getElementById("consultar-ids-nav");
  const registerTecnicosNav = document.getElementById("register-tecnicos");
  const sacMicuentaNav = document.getElementById("sac-micuenta-nav");
  const almacenActividadesNav = document.getElementById("almacen-actividades-nav");

  if (consultarIDsNav) consultarIDsNav.style.display = "none";
  if (registerTecnicosNav) registerTecnicosNav.style.display = "none";
  if (sacMicuentaNav) sacMicuentaNav.style.display = "none";
  if (almacenActividadesNav) almacenActividadesNav.style.display = "none";

  if (area === "almacen") {
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
  }

  if (area === "sac") {
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }

  if (area === "it") {
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
    if (registerTecnicosNav) registerTecnicosNav.style.display = "block";
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }
}

function setupEventListeners() {
  document.getElementById("delivery-form").addEventListener("submit", function(event) {
    event.preventDefault();
    alert("Formulario enviado");
  });

  document.getElementById("device-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const deviceId = document.getElementById("device-id").value;
    const simNumber = document.getElementById("sim-number").value;

    const tableBody = document.getElementById("device-table-body");
    const row = document.createElement("tr");

    const cellDeviceId = document.createElement("td");
    cellDeviceId.textContent = deviceId;

    const cellSimNumber = document.createElement("td");
    cellSimNumber.textContent = simNumber;

    const cellActions = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.addEventListener("click", function() {
      tableBody.removeChild(row);
    });

    cellActions.appendChild(deleteButton);

    row.appendChild(cellDeviceId);
    row.appendChild(cellSimNumber);
    row.appendChild(cellActions);

    tableBody.appendChild(row);

    document.getElementById("device-form").reset();
  });

  document.getElementById("upload-btn").addEventListener("click", function() {
    const fileInput = document.getElementById("file-upload");
    const file = fileInput.files[0];

    if (!file) {
      alert("Por favor, selecciona un archivo Excel");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      rows.forEach((row, index) => {
        if (index === 0) return;

        const [deviceId, simNumber] = row;
        if (deviceId && simNumber) {
          const tableBody = document.getElementById("device-table-body");
          const newRow = document.createElement("tr");

          const cellDeviceId = document.createElement("td");
          cellDeviceId.textContent = deviceId;

          const cellSimNumber = document.createElement("td");
          cellSimNumber.textContent = simNumber;

          const cellActions = document.createElement("td");
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Eliminar";
          deleteButton.className = "btn btn-danger btn-sm";
          deleteButton.addEventListener("click", function() {
            tableBody.removeChild(newRow);
          });

          cellActions.appendChild(deleteButton);

          newRow.appendChild(cellDeviceId);
          newRow.appendChild(cellSimNumber);
          newRow.appendChild(cellActions);

          tableBody.appendChild(newRow);
        }
      });
    };

    reader.readAsArrayBuffer(file);
  });

  document.getElementById("clear-btn").addEventListener("click", function() {
    const tableBody = document.getElementById("device-table-body");
    tableBody.innerHTML = "";
  });

  document.getElementById("image-upload").addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        const imagePreview = document.getElementById("image-preview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };

      reader.readAsDataURL(file);
    }
  });

  const roleSelect = document.getElementById("role");
  const tecnicoField = document.getElementById("tecnico-field");
  const guiaDhlField = document.getElementById("guia-dhl-field");
  const clientField = document.getElementById("client-field");

  roleSelect.addEventListener("change", async function() {
    const selectedRole = this.value;

    tecnicoField.style.display = "none";
    guiaDhlField.style.display = "none";
    clientField.style.display = "none";

    if (selectedRole === "tecnico") {
      tecnicoField.style.display = "block";
      await loadTechnicians(); // Llama a la función para cargar técnicos
    } else if (selectedRole === "cliente") {
      guiaDhlField.style.display = "block";
      clientField.style.display = "block";
      await loadClients(); // Llama a la función para cargar clientes
    }
  });
}

async function loadClients() {
  const clientDropdown = document.getElementById("client-dropdown");
  clientDropdown.innerHTML = "<option>Seleccionar cliente</option>";
  clientDropdown.style.display = "block";

  try {
    const clientsSnapshot = await getDocs(collection(db, "clientes"));
    clientsSnapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.data().nombre;
      clientDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
  }
}

async function loadTechnicians() {
  const tecnicoDropdown = document.getElementById("tecnico-dropdown");
  tecnicoDropdown.innerHTML = "<option>Seleccionar técnico</option>";
  tecnicoDropdown.style.display = "block";

  try {
    const techniciansSnapshot = await getDocs(collection(db, "tecnicos"));
    techniciansSnapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.data().nombre;
      tecnicoDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los técnicos:", error);
  }
}
