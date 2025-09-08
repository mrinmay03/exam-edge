document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM Elements =====
  const mainSidebar = document.getElementById("sidebar");
  const secondarySidebar = document.querySelector(".secondary-sidebar");

  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const addQuestionModal = document.getElementById("addQuestionModal");
  const closeAddQuestionModalBtn = document.querySelector(".close-btn");

  const manualQuestionBtn = document.getElementById("manualQuestionBtn");
  const excelQuestionBtn = document.getElementById("excelQuestionBtn");
  const manualForm = document.getElementById("manualQuestionForm");
  const questionManagerActions = document.querySelector(".question-actions");
  const questionListContainer = document.getElementById("questionListContainer");
  const questionList = document.getElementById("questionList");

  const excelUploadForm = document.getElementById("excelUploadForm");
  const excelFileInput = document.getElementById("excelFile");
  const cancelExcelUploadBtn = document.getElementById("cancelExcelUpload");

  const basicForm = document.getElementById("basicForm");
  const setsForm = document.getElementById("setsForm");

  // ===== Logout =====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/auth/logout";
    });
  }

  // ===== Toast Function =====
  function showToast(msg, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === "error" ? "#e63946" : "#04bf62";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // ===== Sidebar Toggle =====
  window.toggleSidebar = function () {
    if (mainSidebar) mainSidebar.classList.toggle("collapsed");
    if (secondarySidebar) secondarySidebar.classList.toggle("collapsed");
  };

  // ===== 3-dot Edit Button =====
  document.querySelectorAll(".edit-bank-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (mainSidebar) mainSidebar.classList.add("collapsed");
      showToast("✏️ Editing Question Bank");
    });
  });

  // ===== Basic Settings Save =====
  if (basicForm) {
    basicForm.addEventListener("submit", async e => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("bankName").value,
        subject: document.getElementById("subject").value,
        description: document.getElementById("description").value
      };
      try {
        const bankId = window.location.pathname.split("/").pop();
        const res = await fetch(`/api/question-banks/${bankId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to save");
        showToast("✅ Basic Settings Saved");
      } catch {
        showToast("❌ Failed to save", "error");
      }
    });
  }

  // ===== Add Question Modal =====
  if (addQuestionBtn && addQuestionModal) {
    addQuestionBtn.addEventListener("click", () => {
      addQuestionModal.style.display = "block";
      document.getElementById("modalMainActions").style.display = "block";
      excelUploadForm.style.display = "none";
    });
  }
  if (closeAddQuestionModalBtn && addQuestionModal) {
    closeAddQuestionModalBtn.addEventListener("click", () => {
      addQuestionModal.style.display = "none";
    });
  }
  window.addEventListener("click", e => {
    if (e.target === addQuestionModal) addQuestionModal.style.display = "none";
  });

  // ===== Manual / Excel Question Buttons =====
  if (manualQuestionBtn && manualForm && questionManagerActions && addQuestionModal && questionListContainer) {
    manualQuestionBtn.addEventListener("click", () => {
      addQuestionModal.style.display = "none";
      manualForm.style.display = "block";
      questionManagerActions.style.display = "none";
      questionListContainer.style.display = "none";
      showToast("✏️ Manual Question Creation Activated");
    });
  }

  if (excelQuestionBtn && excelUploadForm && addQuestionModal) {
    excelQuestionBtn.addEventListener("click", () => {
      addQuestionModal.style.display = "block";
      document.getElementById("modalMainActions").style.display = "none";
      excelUploadForm.style.display = "flex";
      showToast("📊 Upload Excel File");
    });
  }

  if (cancelExcelUploadBtn && excelUploadForm) {
    cancelExcelUploadBtn.addEventListener("click", () => {
      excelUploadForm.reset();
      excelUploadForm.style.display = "none";
      document.getElementById("modalMainActions").style.display = "block";
      showToast("❌ Excel upload cancelled");
    });
  }

  if (excelUploadForm) {
    excelUploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!excelFileInput.files.length) return showToast("❌ No file selected", "error");

      const file = excelFileInput.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const bankId = window.location.pathname.split("/").pop();
        const res = await fetch(`/api/question-banks/${bankId}/upload-excel`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload file");
        showToast("✅ Excel uploaded successfully");
        excelUploadForm.reset();
        excelUploadForm.style.display = "none";
        loadQuestions();
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to upload Excel", "error");
      }
    });
  }

  // ===== Manual Form Submit =====
  if (manualForm) {
    manualForm.addEventListener("submit", async e => {
      e.preventDefault();
      const payload = {
        qNo: parseInt(document.getElementById("qNo").value),
        questionText: document.getElementById("questionText").value,
        optionA: document.getElementById("optionA").value,
        optionB: document.getElementById("optionB").value,
        optionC: document.getElementById("optionC").value,
        optionD: document.getElementById("optionD").value,
        rightOption: document.getElementById("rightOption").value,
        questionType: document.getElementById("questionType").value,
        subjectCategory: document.getElementById("subjectCategory").value,
        solutionText: document.getElementById("solutionText").value
      };
      try {
        const bankId = window.location.pathname.split("/").pop();
        const res = await fetch(`/api/question-banks/${bankId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to add question");
        showToast(`✅ Question ${payload.qNo} added`);
        manualForm.reset();
        manualForm.style.display = "none";
        questionManagerActions.style.display = "flex";
        questionListContainer.style.display = "block";
        loadQuestions();
      } catch {
        showToast("❌ Failed to add question", "error");
      }
    });
  }

  // ===== Cancel Manual Question =====
  if (manualForm && questionManagerActions) {
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("action-btn");
    manualForm.appendChild(cancelBtn);
    cancelBtn.addEventListener("click", () => {
      manualForm.style.display = "none";
      questionManagerActions.style.display = "flex";
      questionListContainer.style.display = "block";
      showToast("❌ Manual Question Creation Cancelled");
    });
  }

  // ===== Load Questions =====
  async function loadQuestions() {
    if (!questionList) return;
    questionList.innerHTML = "";
    try {
      const bankId = window.location.pathname.split("/").pop();
      const res = await fetch(`/api/question-banks/${bankId}`);
      if (!res.ok) throw new Error("Failed to load questions");
      const bank = await res.json();
      if (!bank.questions) return;

      bank.questions.sort((a, b) => a.qNo - b.qNo).forEach(q => {
        const item = document.createElement("div");
        item.classList.add("question-item");
        item.innerHTML = `
          <div class="question-header">Q${q.qNo}: ${q.questionText}</div>
          <div class="options">
            ${["optionA", "optionB", "optionC", "optionD"].map(opt =>
          `<div class="option ${q.rightOption === opt.slice(-1) ? "right" : ""}">${opt.slice(-1)}: ${q[opt]}</div>`
        ).join("")}
          </div>
          <div class="meta">Type: ${q.questionType} | Subject: ${q.subjectCategory}</div>
          ${q.solutionText ? `<div class="solution">Solution: ${q.solutionText}</div>` : ""}
        `;
        questionList.appendChild(item);
      });
    } catch {
      showToast("❌ Failed to load questions", "error");
    }
  }

  // ===== Test Sets Save =====
  if (setsForm) {
    setsForm.addEventListener("submit", async e => {
      e.preventDefault();
      const questionOrder = setsForm.querySelector('input[name="questionOrder"]:checked').value;
      try {
        const bankId = window.location.pathname.split("/").pop();
        const res = await fetch(`/api/question-banks/${bankId}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionOrder })
        });
        if (!res.ok) throw new Error("Failed to save");
        showToast("✅ Test Settings Saved");
      } catch {
        showToast("❌ Failed to save", "error");
      }
    });
  }

  // ===== Secondary Sidebar Navigation =====
  document.querySelectorAll(".secondary-sidebar a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll(".secondary-sidebar a").forEach(a => a.classList.remove("active"));
      document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

      link.classList.add("active");
      const target = document.getElementById(link.dataset.section);
      if (target) target.classList.add("active");
    });
  });

  loadQuestions();
});
