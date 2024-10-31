import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
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
});

// Inicializa la página y configura la fecha y hora automáticas
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
      setAutomaticDateTime(); // Configura la fecha y hora automáticamente
      loadClients(); // Cargar los clientes en el dropdown
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

// Muestra los detalles del usuario en los inputs
function displayUserDetails(displayName, email) {
  const userNameInput = document.getElementById("user-name");
  const userEmailInput = document.getElementById("user-email");

  if (userNameInput) userNameInput.value = displayName || "Usuario";
  if (userEmailInput) userEmailInput.value = email || "Correo no disponible";
}

// Cargar la lista de clientes en el dropdown
async function loadClients() {
  const clientDropdown = document.getElementById("cliente");
  const clientsSnapshot = await getDocs(collection(db, "clientes"));
  clientsSnapshot.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().nombre;
    clientDropdown.appendChild(option);
  });
}

// Configura la fecha y hora actuales
function setAutomaticDateTime() {
  const fechaHoraInput = document.getElementById("fechaHora");
  if (fechaHoraInput) {
    const now = new Date();
    fechaHoraInput.value = now.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
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
  document.getElementById('registrarActividad').addEventListener('click', async () => {
    const actividadData = {
      nombre: document.getElementById('user-name').value,
      correo: document.getElementById('user-email').value,
      fechaHora: document.getElementById('fechaHora').value,
      cliente: document.getElementById('cliente').value,
      actividad: document.getElementById('actividad').value,
      descripcion: document.getElementById('descripcion').value,
      estatus: document.getElementById('estatus').value
    };

    try {
      await addDoc(collection(db, "actividades"), actividadData);
      Swal.fire("Éxito", "Su actividad fue registrada correctamente", "success");

    } catch (error) {
      Swal.fire("Error", "Hubo un problema al registrar la actividad", "error");
      console.error("Error al guardar la actividad:", error);
    }
  });
}