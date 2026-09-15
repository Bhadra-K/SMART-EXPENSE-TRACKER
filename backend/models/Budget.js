const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    alertThreshold: {
      type: Number,
      enum: [70, 80, 90, 100],
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);