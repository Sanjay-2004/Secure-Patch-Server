import express from "express";
const router = express.Router();
import nodemailer from "nodemailer";
import { Employee, validate } from "../Models/Employee.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import passwordComplexity from "joi-password-complexity";

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: 587,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendEmail = async (email, subject, password, privateKey, address) => {
  try {
    const mailing = {
      from: '"Admin1" <admin@company.com>',
      to: email,
      subject: subject,
      html: `
        <p>This is your password:</p>
        <p>${password}</p>
        <p>Private key:</p>
        <p>${privateKey}</p>
        <p>Address:</p>
        <p>${address}</p>
        <p>Visit <a href="http://localhost:5173/reporter">google.com</a> for more information.</p>
      `,
    };

    transporter.sendMail(mailing, (error, info) => {
      if (error) console.log("Error sending mail:", error);
      else console.log("Email sent:", info.response);
    });
  } catch (error) {
    //console.log("Error sending mail:", error);
  }
};

router.post("/", async (req, res) => {
  try {
    console.log("entered here");
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { privateKey, ...employeeData } = req.body; // Exclude privateKey from req.body
    console.log(privateKey);
    console.log(employeeData);
    const employee = await Employee.findOne({ email: employeeData.email });
    if (employee)
      return res
        .status(409)
        .send({ message: "Employee with given email already exists" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(employeeData.password, salt);
    const newEmployee = await new Employee({
      ...employeeData,
      password: hashPassword,
    }).save();

    if (newEmployee) {
      const subject = "WELCOME TO OUR COMPANY";

      sendEmail(
        employeeData.email,
        subject,
        employeeData.password,
        privateKey,
        employeeData.address
      );

      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    //console.log(req);
    const token = req.headers.authorization.split(" ")[1];
    const emailID = jwt.verify(token, process.env.JWTPRIVATEKEY).email;
    const empDetails = await Employee.findOne({ email: emailID });
    if (empDetails) {
      res.json(empDetails);
    } else {
      return res.status(404).send({ message: "Employee not found" });
    }
  } catch (error) {
    //console.log("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const emailID = jwt.verify(token, process.env.JWTPRIVATEKEY).email;
    console.log("Email: ", emailID);
    const empDetails = await Employee.findOne({ email: emailID });
    if (!empDetails) {
      return res.status(404).send({ message: "Employee not found" });
    }
    console.log(empDetails);
    const passwordMatch = await bcrypt.compare(password, empDetails.password);
    if (!passwordMatch) {
      return res.status(400).send({ message: "Invalid password" });
    }

    const passwordValidationResult = validatePass(newPassword);
    if (passwordValidationResult.error) {
      return res
        .status(400)
        .send({ message: passwordValidationResult.error.details[0].message });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(newPassword, salt);

    empDetails.password = hashPassword;
    empDetails.verified = true;

    await empDetails.save();

    res.sendStatus(200);
  } catch (error) {
    console.log("Error:", error);

    res.status(500).send({ message: "Internal Server Error" });
  }
});

const validatePass = (password) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };

  return passwordComplexity(complexityOptions).validate(password);
};

export default router;
