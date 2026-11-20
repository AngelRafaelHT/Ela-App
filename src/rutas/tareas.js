import { Router } from "express";
import { db } from "../db.js";

export const rutasTareas = Router();


const aJSON = (fila) => fila && { ...fila, completada: fila.completada === 1 };


function validarTitulo(titulo) {
  if (typeof titulo !== "string" || titulo.trim().length === 0) return "El título es obligatorio";
  if (titulo.trim().length > 100) return "El título no puede pasar de 100 caracteres";
  return null;
}


rutasTareas.get("/", (req, res) => {
  const { estado } = req.query;
  let filas;

  if (estado === "pendientes") {
    filas = db.prepare("SELECT * FROM tareas WHERE completada = ? ORDER BY id DESC").all(0);
  } else if (estado === "completadas") {
    filas = db.prepare("SELECT * FROM tareas WHERE completada = ? ORDER BY id DESC").all(1);
  } else {
    filas = db.prepare("SELECT * FROM tareas ORDER BY id DESC").all();
  }

  res.json(filas.map(aJSON));
});


rutasTareas.get("/:id", (req, res) => {
  const tarea = db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id);
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(aJSON(tarea));
});


rutasTareas.post("/", (req, res) => {
  const error = validarTitulo(req.body.titulo);
  if (error) return res.status(400).json({ error });

  const resultado = db.prepare("INSERT INTO tareas (titulo) VALUES (?)").run(req.body.titulo.trim());
  const tarea = db.prepare("SELECT * FROM tareas WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json(aJSON(tarea));
});


rutasTareas.put("/:id", (req, res) => {
  const actual = db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id);
  if (!actual) return res.status(404).json({ error: "Tarea no encontrada" });

  const titulo = req.body.titulo ?? actual.titulo;
  const error = validarTitulo(titulo);
  if (error) return res.status(400).json({ error });
  const completada = req.body.completada ?? actual.completada === 1;

  db.prepare("UPDATE tareas SET titulo = ?, completada = ? WHERE id = ?")
    .run(titulo.trim(), completada ? 1 : 0, req.params.id);
  res.json(aJSON(db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id)));
});


rutasTareas.delete("/:id", (req, res) => {
  const resultado = db.prepare("DELETE FROM tareas WHERE id = ?").run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ error: "Tarea no encontrada" });
  res.status(204).end();
});