
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, phone, and password." });
  }

  try {
    
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists." });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
      [name, email, phone, hashedPassword]
    );

    const user = result.rows[0];
   
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("email", email);
  console.log("password", password);
  if (!email || !password)
    return res
      .status(400)
      .json({ error: "Please provide email and password." });

  try {
   
    const isAdminEmail = email.includes("@egniol.com");

    let result;
    let user;
    let role;

    if (isAdminEmail) {

      result = await pool.query("SELECT * FROM admin WHERE email = $1", [
        email,
      ]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Invalid credentials." });
      }
      user = result.rows[0];
      role = "admin";
    } else {

      result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Invalid credentials." });
      }
      user = result.rows[0];
      role = "user";
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("token", token);


    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, 
    });

    return res.json({
      message: "Login successful",
      role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};

exports.auth = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);

    let user;
    let role = req.user.role;

    if (req.user.role === "admin") {
      user = await pool.query(
        "SELECT id, name, email FROM admin WHERE id = $1",
        [req.user.id]
      );
    } else {
      user = await pool.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [req.user.id]
      );
    }

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ ...user.rows[0], role });
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
