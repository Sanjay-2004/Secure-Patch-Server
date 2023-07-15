import express from "express";
const router = express.Router();
import Bug from "../Models/Bug.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

router
  .route("/")
  .post(async (req, res) => {
    try {
      const { token, bugDescription } = req.body;
      const email = jwt.verify(token, process.env.JWTPRIVATEKEY).email;

      const bug = await Bug.create({ email, bugDescription });
      if (bug) {
        //console.log("Bug submitted:", bug);
        res.send({
          status: "Successful",
        });
      } else {
        console.error("Error saving bug");
        res.sendStatus(500);
      }
    } catch (error) {
      console.error("Error saving bug:", error);
      res.sendStatus(500);
    }
  })
  .get(async (req, res) => {
    try {
      const bugReports = await Bug.find().sort({ date: -1 });
      //console.log("Bug reports fetched:", bugReports);
      res.json(bugReports);
    } catch (error) {
      console.error("Error fetching bug reports:", error);
      res.sendStatus(500);
    }
  });

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { okbyReporter } = req.body;

    const bug = await Bug.findByIdAndUpdate(
      id,
      { okbyReporter },
      { new: true }
    );
    if (bug) {
      res.sendStatus(200);
    } else {
      console.error("Bug report not found");
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error updating bug report:", error);
    res.sendStatus(500);
  }
});

export default router;
