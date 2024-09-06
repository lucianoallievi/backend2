import express from "express";
import jwt from "jsonwebtoken";
import UserManager from "../managers/user.manager.js";

const router = express.Router();
const userManager = new UserManager();

router.post("/register", async (req, res) => {
  try {
    const userCreated = await userManager.insertOne(req.body);
    res.status(200).json({ status: true, payload: userCreated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await userManager.getOneByEmailAndPassword(
      email,
      password
    );
    const accessToken = jwt.sign(
      { id: userFound._id, email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({ status: true, token: accessToken });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

export default router;
