const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password,budget } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      budget: budget || 0,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "7d" });

    res.status(201).json({
      msg: "User created successfully ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "7d" });

    res.status(200).json({
      msg: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};