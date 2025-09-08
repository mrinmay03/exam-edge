const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  qNo: { type: Number, required: true },
  questionText: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  rightOption: { type: String, required: true },
  questionType: { type: String, default: "MCQ" },
  subjectCategory: { type: String, required: true },
  solutionText: { type: String, default: "" },
  settings: {   questionOrder: { type: String, default: "fixed" }}, // add more settings if needed
});

const questionBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: "" },
  questions: { type: [questionSchema], default: [] }, // Array of questions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuestionBank", questionBankSchema);
