import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Employee } from "../Models/Employee.js";

dotenv.config();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    //console.log(token);
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const emailId = jwt.verify(token, process.env.JWTPRIVATEKEY).email;
    //console.log(emailId);

    const employee = await Employee.findOne({ email: emailId });
    //console.log(employee);
    if (!employee) {
      return res.status(404).send({ message: "Employee not found" });
    }

    if (!employee.verified) {
      //console.log("mm", employee.verified);
      return res.send({
        status: "Successful",
      });
    }
  } catch (error) {
    //console.log("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
