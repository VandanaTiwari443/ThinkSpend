const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const { getProfile } = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);

router.put("/budget", authMiddleware, async (req, res) => {
  try {
    const budgetValue = Number(req.body.budget);

    if (Number.isNaN(budgetValue) || budgetValue <= 0) {
      return res.status(400).json({ msg: "Please enter a valid budget" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { budget: budgetValue },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log("Budget update error:", err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;