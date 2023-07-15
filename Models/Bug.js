import mongoose from "mongoose";
const BugSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  bugDescription: String,
  date: {
    type: Date,
    default: Date.now,
  },
  okbyReporter: {
    type: Boolean,
    default: false,
  },
});

const Bug = mongoose.model("BugReports", BugSchema, "BugReports");

export default Bug;
