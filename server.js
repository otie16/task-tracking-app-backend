const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5000;

// Set up PostgreSQL connection
const pool = new Pool({
    user: 'otie16',
    host: 'localhost',
    database: 'taskdatadb',
    password: 'mypassword',
    port: 5432,
});

app.use(cors());
app.use(express.json());

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching tasks");
  }
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const { text, completed } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (text, completed) VALUES ($1, $2) RETURNING *",
      [text, completed]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding task");
  }
});

// Update a task (toggle completion)
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating task");
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting task");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
