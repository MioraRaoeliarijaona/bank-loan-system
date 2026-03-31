const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Bank Loan System Backend is running successfully!" });
});

// ==================== GET ALL LOANS ====================
app.get("/api/loans", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, n_compte, nom_client, nom_banque, montant, date_pret, taux_pret, created_at, updated_at FROM Pret_bancaire ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ error: "Error fetching loans", details: error.message });
  }
});

// ==================== GET SINGLE LOAN ====================
app.get("/api/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, n_compte, nom_client, nom_banque, montant, date_pret, taux_pret FROM Pret_bancaire WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching loan:", error);
    res.status(500).json({ error: "Error fetching loan", details: error.message });
  }
});

// ==================== CREATE NEW LOAN ====================
app.post("/api/loans", async (req, res) => {
  try {
    const { n_compte, nom_client, nom_banque, montant, date_pret, taux_pret } = req.body;

    // Validation
    if (!n_compte || !nom_client || !nom_banque || !montant || !date_pret || taux_pret === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO Pret_bancaire (n_compte, nom_client, nom_banque, montant, date_pret, taux_pret) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [n_compte, nom_client, nom_banque, montant, date_pret, taux_pret]
    );

    res.status(201).json({ 
      message: "Loan created successfully", 
      loan: result.rows[0] 
    });
  } catch (error) {
    console.error("Error creating loan:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Account number already exists" });
    }
    res.status(500).json({ error: "Error creating loan", details: error.message });
  }
});

// ==================== UPDATE LOAN ====================
app.put("/api/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { n_compte, nom_client, nom_banque, montant, date_pret, taux_pret } = req.body;

    // Validation
    if (!n_compte || !nom_client || !nom_banque || !montant || !date_pret || taux_pret === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "UPDATE Pret_bancaire SET n_compte = $1, nom_client = $2, nom_banque = $3, montant = $4, date_pret = $5, taux_pret = $6 WHERE id = $7 RETURNING *",
      [n_compte, nom_client, nom_banque, montant, date_pret, taux_pret, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.json({ 
      message: "Loan updated successfully", 
      loan: result.rows[0] 
    });
  } catch (error) {
    console.error("Error updating loan:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Account number already exists" });
    }
    res.status(500).json({ error: "Error updating loan", details: error.message });
  }
});

// ==================== DELETE LOAN ====================
app.delete("/api/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM Pret_bancaire WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.json({ message: "Loan deleted successfully", deletedId: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ error: "Error deleting loan", details: error.message });
  }
});

// ==================== GET STATISTICS ====================
app.get("/api/statistics/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(montant * (1 + taux_pret / 100)) as montant_total_payer,
        MIN(montant * (1 + taux_pret / 100)) as montant_min_payer,
        MAX(montant * (1 + taux_pret / 100)) as montant_max_payer,
        AVG(montant * (1 + taux_pret / 100)) as montant_avg_payer,
        SUM(montant) as montant_total_pret
      FROM Pret_bancaire
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Error fetching statistics", details: error.message });
  }
});

// ==================== GET STATISTICS BY BANK ====================
app.get("/api/statistics/by-bank", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nom_banque,
        COUNT(*) as total_loans,
        SUM(montant * (1 + taux_pret / 100)) as montant_total_payer,
        SUM(montant) as montant_total_pret
      FROM Pret_bancaire
      GROUP BY nom_banque
      ORDER BY montant_total_payer DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bank statistics:", error);
    res.status(500).json({ error: "Error fetching bank statistics", details: error.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database connected to: ${process.env.DB_NAME}`);
});
