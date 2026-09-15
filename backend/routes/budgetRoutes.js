const express = require("express");
const router = express.Router();

const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.userId,
    }).sort({
      year: -1,
      month: -1,
    });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch budgets",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      category,
      amount,
      month,
      year,
      alertThreshold,
    } = req.body;

    const budget = new Budget({
      category,
      amount,
      month,
      year,
      alertThreshold:
        alertThreshold === undefined
          ? 80
          : Number(alertThreshold),
      userId: req.userId,
    });

    const savedBudget = await budget.save();

    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add budget",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedBudget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedBudget) {
      return res.status(404).json({
        message: "Budget not found.",
      });
    }

    res.json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete budget",
      error: error.message,
    });
  }
});

module.exports = router;