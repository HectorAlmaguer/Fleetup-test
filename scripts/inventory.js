import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { app } from "../scripts/app.js";

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../index.html";
    } else {
      const userNameDisplay = document.getElementById("user-name");
      const userEmailDisplay = document.getElementById("user-email");
      userNameDisplay.value = user.displayName;
      userEmailDisplay.value = user.email;

      try {
        const uid = user.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          configureUserOptions(userData.area);
        } else {
          Swal.fire("Error", "Usuario no encontrado en Firestore. Cerrando sesión.", "error");
          signOut(auth).then(() => window.location.href = "../index.html");
        }
      } catch (error) {
        Swal.fire("Error", "Ocurrió un error al obtener los datos del usuario.", "error");
      }
    }
  });

  function configureUserOptions(area) {
    const buttons = {
      btnDelivery: document.getElementById("btn-delivery"),
      btnAlmacenActividades: document.getElementById("almacen-actividades-nav"),
      btnConsultarID: document.getElementById("consultar-ids-nav"),
      btnTecnicos: document.getElementById("register-tecnicos"),
      btnSACMiCuenta: document.getElementById("sac-micuenta-nav")
    };

    Object.values(buttons).forEach((btn) => {
      if (btn) btn.style.display = "none";
    });

    if (area === "almacen" || area === "it") {
      if (buttons.btnDelivery) buttons.btnDelivery.style.display = "block";
      if (buttons.btnAlmacenActividades) buttons.btnAlmacenActividades.style.display = "block";
      if (buttons.btnConsultarID) buttons.btnConsultarID.style.display = "block";
    }

    if (area === "sac") {
      if (buttons.btnSACMiCuenta) buttons.btnSACMiCuenta.style.display = "block";
    }
  }

  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "../index.html";
    } catch (error) {
      Swal.fire("Error", "Error al cerrar sesión.", "error");
    }
  });

  document.getElementById("upload-btn").addEventListener("click", () => {
    const fileInput = document.getElementById("file-upload");
    const file = fileInput.files[0];

    if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const tableBody = document.getElementById("inventory-table").getElementsByTagName("tbody")[0];
        tableBody.innerHTML = "";

        rows.forEach((row) => {
          const { ID, SIM, "Tipo Equipo": tipoEquipo, Año: ano } = row;
          const caducidad = parseInt(ano) + 3;

          const newRow = tableBody.insertRow();
          newRow.insertCell(0).textContent = ID;
          newRow.insertCell(1).textContent = SIM;
          newRow.insertCell(2).textContent = tipoEquipo;
          newRow.insertCell(3).textContent = ano;
          newRow.insertCell(4).textContent = caducidad;
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      Swal.fire("Error", "Por favor seleccione un archivo Excel válido.", "error");
    }
  });

  document.getElementById("submit-btn").addEventListener("click", async () => {
    const tableBody = document.getElementById("inventory-table").getElementsByTagName("tbody")[0];
    const rows = tableBody.getElementsByTagName("tr");

    try {
      for (let row of rows) {
        const data = {
          ID: row.cells[0].textContent,
          SIM: row.cells[1].textContent,
          tipoEquipo: row.cells[2].textContent,
          ano: row.cells[3].textContent,
          caducidad: row.cells[4].textContent
        };
        await addDoc(collection(db, "inventory"), data);
      }
      Swal.fire("Éxito", "Inventario guardado correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar el inventario", "error");
    }
  });
});
