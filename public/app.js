const lista = document.querySelector("#lista");
const form = document.querySelector("#form-tarea");
const titulo = document.querySelector("#titulo");
const error = document.querySelector("#error");
const botonesFiltro = document.querySelectorAll(".filtros button");

let filtroActual = "";

async function api(url, metodo = "GET", datos) {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: datos && JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json();
    throw new Error(cuerpo.error);
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

async function cargar() {
  const endpoint = filtroActual ? `/api/tareas?estado=${filtroActual}` : "/api/tareas";
  const tareas = await api(endpoint); // GET

  lista.replaceChildren(
    ...tareas.map((tarea) => {
      const li = document.createElement("li");

      const casilla = document.createElement("input");
      casilla.type = "checkbox";
      casilla.checked = tarea.completada;
      casilla.addEventListener("change", async () => {
        await api(`/api/tareas/${tarea.id}`, "PUT", { completada: casilla.checked }); // PUT
        cargar();
      });

      const texto = document.createElement("span");
      texto.textContent = tarea.titulo;
      if (tarea.completada) texto.className = "hecha";

      const borrar = document.createElement("button");
      borrar.textContent = "Eliminar";
      borrar.addEventListener("click", async () => {
        await api(`/api/tareas/${tarea.id}`, "DELETE"); // DELETE
        cargar();
      });

      li.append(casilla, texto, borrar);
      return li;
    })
  );
}

botonesFiltro.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    filtroActual = btn.dataset.filtro;
    cargar();
  });
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    await api("/api/tareas", "POST", { titulo: titulo.value }); // POST
    titulo.value = "";
    error.textContent = "";
    cargar();
  } catch (e) {
    error.textContent = e.message;
  }
});

cargar();