import express from "express";
const router = express.Router();
import { User, validate } from "../Models/User.js";
import bcrypt from "bcrypt";

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already Exists!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const token = req.body.token;
    const emailID = jwt.verify(token, process.env.JWTPRIVATEKEY).email;

    const userDetails = await User.findOne({ email: emailID });
    if (userDetails) {
      res.json(userDetails);
    } else {
      return res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    //console.log("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
