import express from "express";
import { rutasTareas } from "./rutas/tareas.js";

const app = express();

app.use(express.json());             
app.use(express.static("public"));   
app.use("/api/tareas", rutasTareas); 


app.use((err, req, res, next) => {
  const codigo = err.status ?? 500; 
  if (codigo === 500) console.error(err);
  res.status(codigo).json({ error: codigo === 500 ? "Error en el servidor" : "Solicitud inválida" });
});

app.listen(3000, () => console.log("Ela App en http://localhost:3000"));