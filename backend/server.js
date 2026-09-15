const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

console.log(
  "Mongo URI loaded:",
  process.env.MONGO_URI ? "YES" : "NO"
);

const app = express();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= PORT =================

const PORT = process.env.PORT || 5000;

// ================= MONGODB =================

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  })
  .then(() => {
    console.log("=================================");
    console.log("MongoDB connected successfully");
    console.log("=================================");
  })
  .catch((error) => {
    console.log("=================================");
    console.log("MONGODB ERROR");
    console.log("Name:", error.name);
    console.log("Message:", error.message);
    console.log("Code:", error.code);
    console.log("CodeName:", error.codeName);
    console.log("=================================");
  });

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.json({
    message: "Smart Expense Tracker API is running",
  });
});

// ================= API ROUTES =================

app.use(
  "/api/expenses",
  require("./routes/expenseRoutes")
);

app.use(
  "/api/income",
  require("./routes/incomeRoutes")
);

app.use("/api/budgets", require("./routes/budgetRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});