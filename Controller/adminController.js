
const pool = require("../config/db");
const bcrypt = require("bcryptjs");


exports.getAllUsers = async (req, res) => {
  try {
    
    const result = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json({ users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;


  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, and password." });
  }

  
  if (!email.includes("@egniol.com")) {
    return res
      .status(400)
      .json({ error: "Admin email must contain @egniol.com" });
  }

  try {
   
    const adminExists = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
      [email]
    );
    if (adminExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists." });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const result = await pool.query(
      `INSERT INTO admin (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    const newAdmin = result.rows[0];

    return res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
