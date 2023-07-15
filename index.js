import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bugsRouter from "./Routes/Bugs.js";
import userRouter from "./Routes/Users.js";
import authRouter from "./Routes/Auth.js";
import employeeRouter from "./Routes/Employees.js";
import transactionRouter from "./Routes/Transactions.js";
import verificationRouter from "./Routes/Verification.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/bugs", bugsRouter);
app.use("/signup", userRouter);
app.use("/login", authRouter);
app.use("/employees", employeeRouter);
app.use("/transactions", transactionRouter);
app.use("/verification", verificationRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
