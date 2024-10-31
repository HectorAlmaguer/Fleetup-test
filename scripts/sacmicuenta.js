import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "../scripts/app.js"; // Asegúrate de que `app.js` exporte `app`

const auth = getAuth(app);
const db = getFirestore(app);

// Verificar autenticación y redirigir si no está autenticado
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = "../index.html";
    } else {
      // Usuario autenticado, obtén los datos de Firestore
      try {
        const uid = user.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const area = userData.area || "";

          // Configurar la visibilidad de la navbar según el área del usuario
          configureNavbarOptions(area);

          // Muestra los datos del usuario en los inputs correspondientes
          displayUserDetails(user.displayName, user.email);

        } else {
          console.log("Usuario no encontrado en Firestore. Cerrando sesión.");
          await auth.signOut();
          window.location.href = "../index.html";
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    }
  });
});

// Función para configurar las opciones de la navbar según el área del usuario
function configureNavbarOptions(area) {
  const consultarIDsNav = document.getElementById("consultar-ids-nav");
  const registerTecnicosNav = document.getElementById("register-tecnicos");
  const sacMicuentaNav = document.getElementById("sac-micuenta-nav");
  const almacenActividadesNav = document.getElementById(
    "almacen-actividades-nav"
  );

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

// Función para mostrar los detalles del usuario en los inputs
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

// Función para cargar equipos
const loadEquipos = async (cuenta) => {
  const equiposTableBody = document.getElementById("equipos-table-body");
  equiposTableBody.innerHTML = "";

  try {
    const equiposQuery = query(
      collection(db, "cuentas", cuenta, "equipos")
    );
    const querySnapshot = await getDocs(equiposQuery);

    querySnapshot.forEach((doc) => {
      const equipo = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doc.id}</td>
        <td>${equipo.sim}</td>
        <td>${equipo.fechaEntrega}</td>
        <td>${equipo.tecnico || equipo.guia}</td>
      `;
      equiposTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error al cargar los equipos:", error);
  }
};

// Logout
document.getElementById("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "../index.html"; // Redirige al login después de cerrar sesión
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});