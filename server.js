const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa o banco de dados SQLite (armazenado em arquivo para persistência real)
const db = new sqlite3.Database('./poemas.db', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Cria a tabela "poems" se não existir
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS poems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )`);
});

// Endpoint: Listar todos os poemas
app.get('/api/poems', (req, res) => {
  db.all("SELECT * FROM poems ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ poems: rows });
  });
});

// Endpoint: Adicionar um novo poema
app.post('/api/poems', (req, res) => {
  const content = req.body.content && req.body.content.trim();
  if (!content) {
    return res.status(400).json({ error: "O conteúdo do poema é obrigatório." });
  }
  db.run("INSERT INTO poems (content) VALUES (?)", [content], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, content });
  });
});

// Endpoint: Atualizar um poema existente
app.put('/api/poems/:id', (req, res) => {
  const id = req.params.id;
  const content = req.body.content && req.body.content.trim();
  if (!content) {
    return res.status(400).json({ error: "O conteúdo do poema é obrigatório." });
  }
  db.run("UPDATE poems SET content = ? WHERE id = ?", [content, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Poema não encontrado." });
    }
    res.json({ id, content });
  });
});

// Endpoint: Excluir um poema
app.delete('/api/poems/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM poems WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Poema não encontrado." });
    }
    res.json({ message: "Poema excluído com sucesso.", id });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
