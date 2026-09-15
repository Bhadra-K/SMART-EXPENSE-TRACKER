const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all expense routes
router.use(authMiddleware);

// GET all expenses for the logged-in user
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
});

// ADD expense for the logged-in user
router.post("/", async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.userId,
    });

    const savedExpense = await expense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add expense",
      error: error.message,
    });
  }
});

// DELETE only the logged-in user's expense
router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
});

module.exports = router;