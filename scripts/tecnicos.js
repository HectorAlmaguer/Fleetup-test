import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "./app.js"; // Asegúrate de que `app.js` exporte `app`

const auth = getAuth(app);
const db = getFirestore(app);

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

          // Configurar envío del formulario
          setupFormSubmission();
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

// Configura las opciones de la navbar según el área del usuario
function configureNavbarOptions(area) {
  const consultarIDsNav = document.getElementById("consultar-ids-nav");
  const registerTecnicosNav = document.getElementById("register-tecnicos");
  const sacMicuentaNav = document.getElementById("sac-micuenta-nav");
  const almacenActividadesNav = document.getElementById("almacen-actividades-nav");

  // Ocultar todos los elementos al inicio
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
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
    if (registerTecnicosNav) registerTecnicosNav.style.display = "block";
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }
}

// Configura el envío del formulario
function setupFormSubmission() {
  const form = document.getElementById("technical-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Obtener datos del formulario
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const correo = document.getElementById("correo").value;
    const rfc = document.getElementById("rfc").value;
    const banco = document.getElementById("banco").value;
    const cuentaClabe = document.getElementById("cuenta-clabe").value;

    // Obtener estados y ciudades seleccionadas
    const selectedStates = Array.from(document.querySelectorAll(".state-checkbox:checked")).map(
      (checkbox) => checkbox.value
    );
    const selectedCities = Array.from(document.querySelectorAll(".city-checkbox:checked")).map(
      (checkbox) => checkbox.value
    );

    // Obtener costos
    const costos = Array.from(document.querySelectorAll(".cost-input")).map((input) => ({
      servicio: input.closest("tr").querySelector("td:first-child").innerText,
      costo: parseFloat(input.value),
    }));

    // Guardar en Firestore
    try {
      await addDoc(collection(db, "tecnicos"), {
        nombre,
        telefono,
        correo,
        rfc,
        banco,
        cuentaClabe,
        cobertura: {
          estados: selectedStates,
          ciudades: selectedCities,
        },
        costos,
      });

      // Mostrar mensaje de éxito
      Swal.fire("Éxito", "El técnico se ha añadido correctamente", "success");

      // Limpiar formulario
      form.reset();
      document.getElementById("ciudades-container").innerHTML = ""; // Limpiar ciudades
    } catch (error) {
      console.error("Error al añadir el técnico:", error);
      Swal.fire("Error", "No se pudo añadir el técnico", "error");
    }
  });
}

