const express = require("express");
const router = express.Router();
const QuestionBank = require("../models/question_bank");

const multer = require("multer");
const xlsx = require("xlsx");

const upload = multer({ dest: "uploads/" });


// ===== Get all question banks =====
router.get("/", async (req, res) => {
  try {
    const banks = await QuestionBank.find();
    res.json(banks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===== Create a new question bank =====
router.post("/", async (req, res) => {
  try {
    const { name, subject, description, questions } = req.body;
    const newBank = new QuestionBank({ name, subject, description, questions });
    await newBank.save();
    res.status(201).json(newBank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create question bank" });
  }
});

// ===== Add a question to a question bank =====
router.post("/:bankId/questions", async (req, res) => {
  const { bankId } = req.params;
  const questionData = req.body;

  try {
    const bank = await QuestionBank.findById(bankId);
    if (!bank) return res.status(404).json({ error: "Bank not found" });

    bank.questions.push(questionData);
    bank.questions.sort((a, b) => a.qNo - b.qNo);

    await bank.save();

    res.status(201).json({
      message: "Question added successfully",
      questions: bank.questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Get a single question bank by ID =====
router.get("/:bankId", async (req, res) => {
  const { bankId } = req.params;
  try {
    const bank = await QuestionBank.findById(bankId);
    if (!bank) return res.status(404).json({ error: "Bank not found" });
    res.json(bank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Upload Excel =====
router.post("/:bankId/upload-excel", upload.single("file"), async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.bankId);
    if (!bank) return res.status(404).json({ error: "Bank not found" });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const questions = xlsx.utils.sheet_to_json(sheet);

    // Example: Map Excel columns to question schema
    questions.forEach(q => {
      bank.questions.push({
        qNo: q.qNo,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        rightOption: q.rightOption,
        questionType: q.questionType || "MCQ",
        subjectCategory: q.subjectCategory,
        solutionText: q.solutionText
      });
    });

    bank.questions.sort((a, b) => a.qNo - b.qNo);
    await bank.save();

    res.json({ message: "Excel questions added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process Excel file" });
  }
});


// ===== Update question bank (Basic Settings) =====
router.put("/:id", async (req, res) => {
  try {
    const { name, subject, description } = req.body;
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Question Bank not found" });

    bank.name = name || bank.name;
    bank.subject = subject || bank.subject;
    bank.description = description || bank.description;

    await bank.save();
    res.json({ message: "Question bank updated successfully", bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update question bank" });
  }
});

// ===== Update Test Settings =====
router.put("/:id/settings", async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Question Bank not found" });

    const { questionOrder } = req.body;
    bank.settings = { ...bank.settings, questionOrder };

    await bank.save();
    res.json({ message: "Test settings updated successfully", settings: bank.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update test settings" });
  }
});

// ===== Delete question bank =====
router.delete("/:id", async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Question Bank not found" });

    await bank.remove();
    res.json({ message: "Question bank deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete question bank" });
  }
});

module.exports = router;
