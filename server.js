const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// SQLite DB setup
const db = new sqlite3.Database("./home.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to home.db");
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS word (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL,
    grammar TEXT,
    definition TEXT,
    additionalInfo TEXT
  )
`);

// Add a new word
app.post("/add", (req, res) => {
  const { term, grammar = "", definition = "", additionalInfo = "" } = req.body;
  const sql = `INSERT INTO word (term, grammar, definition, additionalInfo) VALUES (?, ?, ?, ?)`;
  db.run(sql, [term, grammar, definition, additionalInfo], function (err) {
    if (err) return res.status(500).send(err.message);
    res.send({ id: this.lastID });
  });
});

// Get all words
app.get("/entries", (req, res) => {
  db.all("SELECT * FROM word", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.send(rows);
  });
});

// Delete a word
app.delete("/delete/:id", (req, res) => {
  db.run(`DELETE FROM word WHERE id = ?`, req.params.id, function (err) {
    if (err) return res.status(500).send(err.message);
    res.send({ deleted: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

app.put("/update/:id", (req, res) => {
  const { term, grammar, definition, additionalInfo } = req.body;
  db.run(
    `UPDATE word SET term = ?, grammar = ?, definition = ?, additionalInfo = ? WHERE id = ?`,
    [term, grammar, definition, additionalInfo, req.params.id],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.send({ updated: this.changes });
    }
  );
});