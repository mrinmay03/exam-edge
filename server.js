const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Models
const QuestionBank = require("./models/question_bank");

// Routes
const authRoutes = require("./routes/auth");
const adminUsersRoutes = require("./routes/admin_users");
const questionBankRoutes = require("./routes/admin_question_bank");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
  })
);

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Static Files =====
app.use("/CSS", express.static(path.join(__dirname, "public/CSS")));
app.use("/JS", express.static(path.join(__dirname, "public/JS")));

// ===== Public HTML Pages =====
app.get("/", (req, res) => res.redirect("/index"));
app.get("/index", (req, res) =>
  res.sendFile(path.join(__dirname, "public/HTML/index.html"))
);
app.get("/registration", (req, res) =>
  res.sendFile(path.join(__dirname, "public/HTML/registration.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public/HTML/login.html"))
);

// ===== User Page =====
app.get("/user", (req, res) => {
  if (req.session?.user?.role === "user") {
    res.sendFile(path.join(__dirname, "public/HTML/user.html"));
  } else if (req.session?.user?.role === "admin") {
    res.redirect("/admin");
  } else {
    res.redirect("/login");
  }
});

// ===== Admin Pages =====
const adminPath = path.join(__dirname, "public/HTML/admin");

app.get("/admin", (req, res) => {
  if (req.session?.user?.role === "admin") {
    res.sendFile(path.join(adminPath, "admin.html"));
  } else res.redirect("/login");
});

app.get("/admin/admin_users", (req, res) => {
  if (req.session?.user?.role === "admin") {
    res.sendFile(path.join(adminPath, "admin_users.html"));
  } else res.redirect("/login");
});

app.get("/admin/admin_question_bank", (req, res) => {
  if (req.session?.user?.role === "admin") {
    res.sendFile(path.join(adminPath, "admin_question_bank.html"));
  } else res.redirect("/login");
});

// ===== API Routes =====
// These must come BEFORE dynamic edit_bank route
app.use("/api/admin", adminUsersRoutes);
app.use("/api/question-banks", questionBankRoutes);
app.use("/auth", authRoutes);

// ===== Edit Bank Page =====
app.get("/edit_bank/:id", async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).send("Question Bank not found");
    res.render("edit_bank", { bank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ===== My Account Page =====
app.get("/myaccount", (req, res) => {
  if (req.session?.user) {
    res.sendFile(path.join(__dirname, "public/HTML/myaccount.html"));
  } else res.redirect("/login");
});

// OLD (won't work on Render)
/*mongoose.connect('mongodb://127.0.0.1:27017/exam-edge', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});*/

// NEW (replace <username>, <password>, <dbname>)
mongoose.connect('mongodb+srv://mrinmay03:Mrinmay%4003@exam-edge.urtbnak.mongodb.net/?retryWrites=true&w=majority&appName=exam-edge', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});


// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
