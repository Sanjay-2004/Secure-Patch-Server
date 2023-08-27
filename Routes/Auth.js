import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import Joi from "joi";
import { Employee } from "../Models/Employee.js";
import { User } from "../Models/User.js";
import jwt from "jsonwebtoken";

router.post("/", async (req, res) => {
  try {
    // console.log("\nLogin Request:", req.body);
    const { error } = validate(req.body);
    if (error) {
      console.log("Validation Error:", error);
      return res.status(400).send({ message: error.details[0].message });
    }

    let user = await User.findOne({ email: req.body.email });
    let userType = "user";
    let userRole = null;

    // console.log("User found in User collection:", user);

    if (!user) {
      user = await Employee.findOne({ email: req.body.email });
      userType = "employee";
      if (user) userRole = user.role;
      // console.log("User found in Employee collection:", user);
    }

    if (!user) return res.status(401).send({ message: "Invalid Email" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // console.log("Valid Password:", validPassword);

    if (!validPassword)
      return res.status(401).send({ message: "Invalid Password" });

    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      address: user.address,
    };
    // console.log("Token Payload:", tokenPayload);

    const token = generateAuthToken(tokenPayload);
    // console.log("Generated Token:", token);
    res.status(200).send({ data: token, message: "Logged in successfully" });
  } catch (error) {
    //console.log("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

const generateAuthToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

export default router;
