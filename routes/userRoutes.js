
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const authController = require("../Controller/userController.js");

router.post("/signup", authController.signup);


router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get("/me", authMiddleware.verifyToken, authController.auth);

module.exports = router;
