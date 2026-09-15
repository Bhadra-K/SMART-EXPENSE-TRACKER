const express = require("express");
const router = express.Router();

const Income = require("../models/Income");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all income routes
router.use(authMiddleware);

// GET all income for the logged-in user
router.get("/", async (req, res) => {
  try {
    const income = await Income.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.json(income);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch income",
      error: error.message,
    });
  }
});

// POST new income for the logged-in user
router.post("/", async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.userId,
    });

    const savedIncome = await income.save();

    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add income",
      error: error.message,
    });
  }
});

// DELETE only the logged-in user's income
router.delete("/:id", async (req, res) => {
  try {
    const deletedIncome = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedIncome) {
      return res.status(404).json({
        message: "Income not found.",
      });
    }

    res.json({
      message: "Income deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete income",
      error: error.message,
    });
  }
});

module.exports = router;