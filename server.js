const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const db = require("./db/connection");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const saltRounds = 10;

// --------------------
// AUTH ROUTES
// --------------------

// Sign Up
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User registered successfully" });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(400).send({ error: "User not found" });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).send({ error: "Invalid password" });

      res.send({ message: "Login successful", userId: user.user_id, username: user.username });
    }
  );
});

// --------------------
// TRIP ROUTES
// --------------------

// Submit a trip
// Submit a trip
app.post("/submitTrip", (req, res) => {
  const { userId, startDate, endDate, destination, budget } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  db.query(
    "INSERT INTO trip_requests (user_id, start_date, end_date, destination, budget) VALUES (?, ?, ?, ?, ?)",
    [userId, startDate, endDate, destination, budget],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.json({ message: "Trip submitted successfully!" });
    }
  );
});



// Get all trips
app.get("/trips", (req, res) => {
  db.query(
    "SELECT tr.*, u.username FROM trip_requests tr JOIN users u ON tr.user_id = u.user_id ORDER BY submitted_at DESC",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// --------------------
// START SERVER
// --------------------
app.listen(3000, () => console.log("Server running on port 3000"));
