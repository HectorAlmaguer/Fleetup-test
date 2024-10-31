// Importa Firebase y los módulos que necesitas
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSL5tkPmHefeoUawFUVUJ5cG-gGnnDeTU",
  authDomain: "fleetupapp.firebaseapp.com",
  projectId: "fleetupapp",
  storageBucket: "fleetupapp.appspot.com",
  messagingSenderId: "450428336980",
  appId: "1:450428336980:web:3368fb8a030b926f0ba6c1",
  measurementId: "G-E806BKCN9Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// Manejo del estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const uid = user.uid;

      // Obtén los datos del usuario desde Firestore
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        const area = userData.area || "";
        const nombre = userData.nombre || "";

        // Si ya estás en la página de opciones, no redirigir de nuevo
        if (window.location.pathname.endsWith("opciones.html")) {
          return;
        }

        // Redirigir a la página de opciones
        //window.location.href = "../pages/opciones.html";
      } else {
        console.log("Usuario no encontrado en Firestore. Cerrando sesión.");
        await signOut(auth);
        window.location.href = "../index.html";
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      await signOut(auth);
      window.location.href = "../index.html";
    }
  } else {
    // Redirigir al login solo si no está en la página de inicio
    if (window.location.pathname !== "/index.html") {
      window.location.href = "../index.html";
    }
  }
});

// Función para configurar las opciones dentro de la navbar según el área y nombre
function configurarOpcionesNav(area, nombre) {
  const consultarIDsNav = document.getElementById("consultar-ids-nav");
  const registerTecnicosNav = document.getElementById("register-tecnicos");
  const sacMicuentaNav = document.getElementById("sac-micuenta-nav");
  const almacenActividadesNav = document.getElementById("almacen-actividades-nav");

  // Oculta todos los elementos al inicio
  if (consultarIDsNav) consultarIDsNav.style.display = "none";
  if (registerTecnicosNav) registerTecnicosNav.style.display = "none";
  if (sacMicuentaNav) sacMicuentaNav.style.display = "none";
  if (almacenActividadesNav) almacenActividadesNav.style.display = "none";

  // Configura la visibilidad de acuerdo al área y nombre
  if (area === "almacen") {
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
  }

  if (area === "sac") {
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }

  if (nombre === "Alejandra Dotor" || nombre === "Alexis Gutierrez") {
    if (registerTecnicosNav) registerTecnicosNav.style.display = "block";
  }

  // IT tiene acceso a todas las opciones
  if (area === "it") {
    if (consultarIDsNav) consultarIDsNav.style.display = "block";
    if (almacenActividadesNav) almacenActividadesNav.style.display = "block";
    if (registerTecnicosNav) registerTecnicosNav.style.display = "block";
    if (sacMicuentaNav) sacMicuentaNav.style.display = "block";
  }
}

// Función para iniciar sesión con Google
document.addEventListener("DOMContentLoaded", () => {
  const googleLoginBtn = document.getElementById("google-login-btn");
  const logoutBtn = document.getElementById("logout");

  // Función para iniciar sesión con Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user) {

          // Redirigir a la página de opciones después de iniciar sesión
          window.location.href = "../pages/opciones.html";
        }
      } catch (error) {
        alert("Error durante la autenticación. Por favor, intenta nuevamente.");
      }
    });
  }

  // Función para cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        // Cerrar sesión
        await signOut(auth);

        // Redirigir al login después de cerrar sesión
        window.location.href = "../index.html";
      } catch (error) {
      }
    });
  }
});
