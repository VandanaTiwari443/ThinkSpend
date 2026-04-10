const Expense = require("../models/Expense");

// ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, note, isNecessary, date } = req.body;

    if (amount === undefined || !category) {
      return res.status(400).json({ msg: "Amount and category are required" });
    }

    const newExpense = new Expense({
      amount,
      category,
      note,
      isNecessary,
      user: req.user.id, // ✅ fix
      date: date || Date.now(),
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.log("Add expense error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// GET ALL EXPENSES OF LOGGED-IN USER
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 }); // ✅ fix
    res.json(expenses);
  } catch (error) {
    console.log("Get expenses error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// UPDATE EXPENSE OF LOGGED-IN USER
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id }, // ✅ fix
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.log("Update expense error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// DELETE EXPENSE OF LOGGED-IN USER
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id, // ✅ fix
    });

    if (!deletedExpense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    res.json({ msg: "Expense deleted successfully" });
  } catch (error) {
    console.log("Delete expense error:", error);
    res.status(500).json({ msg: error.message });
  }
};