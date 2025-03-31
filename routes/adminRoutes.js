const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const adminController = require("../Controller/adminController.js");

router.get("/users", authMiddleware.verifyToken, adminController.getAllUsers);

router.post("/create", adminController.createAdmin);

module.exports = router;
