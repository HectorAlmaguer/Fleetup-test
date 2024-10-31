import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
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

// Función para inicializar la página solo para usuarios en área IT o gerentes
async function initializePage(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // Verificar si el área es "it" o "gerente"
    if (userDoc.exists() && (userDoc.data().area === "it" || userDoc.data().area === "gerente")) {
      displayUserDetails(user.displayName, user.email);
      await loadTeamActivities(user.email);
    } else {
      console.error("Acceso denegado. Solo los usuarios del área IT o gerentes pueden acceder a esta página.");
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Error al inicializar la página:", error);
    window.location.href = "../index.html";
  }
}

// Función para mostrar los detalles del usuario
function displayUserDetails(displayName, email) {
  document.getElementById("user-name").textContent = displayName || "Usuario";
  document.getElementById("user-email").textContent = email || "Correo no disponible";
}

// Cargar actividades del equipo
async function loadTeamActivities(managerEmail) {
  try {
    const teamActivitiesTable = document.getElementById("team-activities-table-body");
    teamActivitiesTable.innerHTML = ""; // Limpiar tabla antes de llenarla

    // Obtener usuarios que pertenecen al equipo del gerente o de IT
    const usersSnapshot = await getDocs(query(collection(db, "users"), where("manager", "==", managerEmail)));
    const teamUserIds = usersSnapshot.docs.map(doc => doc.id);

    // Consultar actividades de estos usuarios
    const activitiesSnapshot = await getDocs(collection(db, "actividades"));
    activitiesSnapshot.forEach((doc) => {
      const activityData = doc.data();
      if (teamUserIds.includes(activityData.userId)) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${activityData.userName}</td>
          <td>${activityData.activity}</td>
          <td>${activityData.timestamp.toDate().toLocaleString()}</td>
        `;
        teamActivitiesTable.appendChild(row);
      }
    });
  } catch (error) {
    console.error("Error al cargar las actividades del equipo:", error);
  }
}

