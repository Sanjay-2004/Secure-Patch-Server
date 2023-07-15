import express from "express";
import Transaction from "../Models/Transaction.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const {
      token = req.body.token,
      transactionHash = req.body.transactionHash,
      blockHash = req.body.blockHash,
      sender = req.body.from,
      receiver = req.body.to,
      blockNumber = req.body.blockNumber,
      gasUsed = req.body.gasUsed,
      transactionDone = req.body.transactionDone,
    } = req.body;

    const emailId = jwt.verify(token, process.env.JWTPRIVATEKEY).email;
    const newTransaction = new Transaction({
      emailId,
      transactionHash,
      blockHash,
      sender,
      receiver,
      blockNumber,
      gasUsed,
      transactionDone,
    });

    await newTransaction.save();

    res.status(201).send({ message: "Transaction saved successfully" });
  } catch (error) {
    console.error("Error saving transaction:", error);
    next(new ErrorHandler(500, "Internal Server Error"));
  }
});

router.get("/", async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const emailId = jwt.verify(token, process.env.JWTPRIVATEKEY).email;

    const transactions = await Transaction.find({ emailId: emailId }).sort({
      date: -1,
    });

    if (!transactions) {
      throw new ErrorHandler(
        404,
        "No transactions found for the given email ID"
      );
    }

    res.status(200).send(transactions);
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    next(error);
  }
});

export default router;
