const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Sahaj Backend API" });
});

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.215.17:8081"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
