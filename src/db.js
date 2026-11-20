import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";


mkdirSync("data", { recursive: true });
export const db = new DatabaseSync("data/todo.db");


db.exec(`
  CREATE TABLE IF NOT EXISTS tareas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo     TEXT    NOT NULL,
    completada INTEGER NOT NULL DEFAULT 0,
    creada_en  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);