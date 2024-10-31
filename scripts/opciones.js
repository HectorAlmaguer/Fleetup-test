import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "../scripts/app.js"; // Asegúrate de que `app.js` exporte `app`

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación antes de permitir acciones
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const uid = user.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const area = userData.area || "";
          const nombre = userData.nombre || "";

          // Muestra los datos del usuario en la interfaz
          displayUserDetails(user.displayName, user.email, user.photoURL);

          // Configura las opciones de la interfaz según el área y nombre del usuario
          configureUserOptions(area, nombre);
        } else {
          Swal.fire(
            "Error",
            "Usuario no encontrado en Firestore. Cerrando sesión.",
            "error"
          );
          await signOut(auth);
          window.location.href = "../index.html";
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Ocurrió un error al obtener los datos del usuario.",
          "error"
        );
      }
    } else {
      Swal.fire("No autenticado", "Redirigiendo al login.", "info");
      window.location.href = "../index.html";
    }
  });

  // Función para cerrar sesión
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      Swal.fire(
        "Cerrando sesión...",
        "Espere mientras se cierra la sesión.",
        "info"
      );
      try {
        await signOut(auth);
        Swal.fire(
          "Sesión cerrada",
          "Has cerrado sesión correctamente.",
          "success"
        );
        window.location.href = "../index.html";
      } catch (error) {
        Swal.fire("Error", "Ocurrió un error al cerrar la sesión.", "error");
      }
    });
  }

  // Redirecciones para los botones
  const btnDelivery = document.getElementById("btn-delivery");
  const btnAlmacenActividades = document.getElementById(
    "btn-almacen-actividades"
  );
  const btnConsultarID = document.getElementById("btn-consultar-id");
  const btnTecnicos = document.getElementById("btn-tecnicos");
  const btnSACMiCuenta = document.getElementById("btn-sac-micuenta");
  const btnOrden = document.getElementById("btn-sac-ordenventa");

  if (btnDelivery) {
    btnDelivery.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/delivery.html";
    });
  }

  if (btnAlmacenActividades) {
    btnAlmacenActividades.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/almacen_actividades.html";
    });
  }

  if (btnConsultarID) {
    btnConsultarID.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/consultarid.html";
    });
  }

  if (btnTecnicos) {
    btnTecnicos.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/tecnicos.html";
    });
  }

  if (btnSACMiCuenta) {
    btnSACMiCuenta.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/sacMicuenta.html";
    });
  }
  if (btnOrden) {
    btnOrden.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/pages/orden_venta.html";
    });
  }
});

// Función para mostrar los datos del usuario en la página
function displayUserDetails(displayName, email, photoURL) {
  const userNameDisplay = document.getElementById("user-name-display");
  const userEmailDisplay = document.getElementById("user-email-display");
  const userPhoto = document.getElementById("user-photo");

  if (userNameDisplay) {
    userNameDisplay.textContent = displayName || "Usuario";
  }
  if (userEmailDisplay) {
    userEmailDisplay.textContent = email || "Correo no disponible";
  }
  if (userPhoto && photoURL) {
    userPhoto.src = photoURL;
  }
}

// Función para configurar las opciones según el área y nombre del usuario
function configureUserOptions(area, nombre) {
  const btnDelivery = document.getElementById("btn-delivery");
  const btnAlmacenActividades = document.getElementById(
    "btn-almacen-actividades"
  );
  const btnConsultarID = document.getElementById("btn-consultar-id");
  const btnTecnicos = document.getElementById("btn-tecnicos");
  const btnSACMiCuenta = document.getElementById("btn-sac-micuenta");
  const btnOrden = document.getElementById("btn-sac-ordenventa");

  // Ocultar todos los botones al inicio
  if (btnDelivery) btnDelivery.style.display = "none";
  if (btnAlmacenActividades) btnAlmacenActividades.style.display = "none";
  if (btnConsultarID) btnConsultarID.style.display = "none";
  if (btnTecnicos) btnTecnicos.style.display = "none";
  if (btnSACMiCuenta) btnSACMiCuenta.style.display = "none";

  // Mostrar botones según el área y nombre del usuario
  if (area === "almacen") {
    if (btnDelivery) btnDelivery.style.display = "block";
    if (btnAlmacenActividades) btnAlmacenActividades.style.display = "block";
    if (btnConsultarID) btnConsultarID.style.display = "block";
    if (btnOrden) btnOrden.style.display = "block";
  }

  if (area === "sac") {
    if (btnSACMiCuenta) btnSACMiCuenta.style.display = "block";
    if (btnOrden) btnOrden.style.display = "block";
  }

  if (nombre === "Alejandra Dotor" || nombre === "Alexis Gutierrez") {
    if (btnTecnicos) btnTecnicos.style.display = "block";
    if (btnOrden) btnOrden.style.display = "block";
  }

  if (area === "it") {
    // IT tiene acceso a todas las opciones
    if (btnDelivery) btnDelivery.style.display = "block";
    if (btnAlmacenActividades) btnAlmacenActividades.style.display = "block";
    if (btnConsultarID) btnConsultarID.style.display = "block";
    if (btnTecnicos) btnTecnicos.style.display = "block";
    if (btnSACMiCuenta) btnSACMiCuenta.style.display = "block";
    if (btnOrden) btnOrden.style.display = "block";
  }
}
