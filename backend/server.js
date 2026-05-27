const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/* ✅ CORS FIX */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://think-spend-git-main-vandanatiwarin-5159s-projects.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

/* Routes */
app.get("/", (req, res) => {
  res.send("ThinkSpend API running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);

/* MongoDB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
