document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".question-bank-container");
  const createBtn = document.getElementById("createBankBtn");

  // Modal elements
  const modal = document.getElementById("createBankModal");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("createBankForm");

  // Delete modal elements
  const deleteModal = document.getElementById("deleteConfirmModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const deleteMessage = document.getElementById("deleteMessage");

  let deleteBankId = null;
  let deleteBankName = "";

  // ===== Toast Function =====
  function showToast(message, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = type === "error" ? "#e63946" : "#04bf62";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // ===== Fetch Question Banks =====
  async function fetchQuestionBanks() {
    try {
      const res = await fetch("/api/question-banks");
      if (!res.ok) throw new Error("Failed to fetch question banks");
      const banks = await res.json();

      container.innerHTML = ""; // Clear existing cards

      if (!banks || banks.length === 0) {
        container.innerHTML = "<p>No question banks found. Create one!</p>";
        return;
      }

      banks.forEach((bank) => {
        const card = document.createElement("div");
        card.classList.add("question-bank-card");

        card.innerHTML = `
          <div class="card-options">
            <button class="options-btn">&#x22EE;</button>
            <div class="options-menu">
              <button onclick="editBank('${bank._id}')">Edit</button>
              <button onclick="deleteBank('${bank._id}', '${bank.name}')">Delete</button>
              <button onclick="viewBank('${bank._id}')">View</button>
            </div>
          </div>
          <h3>${bank.name}</h3>
          <p>Subject: ${bank.subject || "N/A"}</p>
          <p>Questions: ${bank.questions?.length || 0}</p>
        `;

        container.appendChild(card);

        // Toggle dropdown
        const optionsBtn = card.querySelector(".options-btn");
        const optionsMenu = card.querySelector(".options-menu");
        optionsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          optionsMenu.classList.toggle("show");
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        document.querySelectorAll(".options-menu").forEach(menu => menu.classList.remove("show"));
      });

    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Error loading question banks.</p>";
      showToast("❌ Error loading question banks", "error");
    }
  }

  // Call fetch on page load
  fetchQuestionBanks();

  // ===== Modal Controls =====
  createBtn.addEventListener("click", () => modal.style.display = "flex");
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
    if (e.target === deleteModal) {
      deleteModal.style.display = "none";
      deleteBankId = null;
      deleteBankName = "";
    }
  });

  // ===== Handle Form Submission (Create Bank) =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bankName = document.getElementById("bankName").value;
    const subject = document.getElementById("subject").value;
    const description = document.getElementById("description").value;

    if (!bankName || !subject) {
      showToast("⚠️ Bank Name and Subject are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/question-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: bankName, subject, description, questions: [] }),
      });

      if (!res.ok) throw new Error("Failed to create question bank");

      showToast(`✅ Question bank "${bankName}" created!`);
      modal.style.display = "none";
      form.reset();
      fetchQuestionBanks();
    } catch (err) {
      console.error(err);
      showToast("❌ Error creating question bank", "error");
    }
  });

  // ===== Confirm Delete Handler =====
  confirmBtn.addEventListener("click", async () => {
    if (!deleteBankId) return;

    try {
      const res = await fetch(`/api/question-banks/${deleteBankId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bank");

      showToast(`🗑️ Deleted "${deleteBankName}"`);
      deleteModal.style.display = "none";
      deleteBankId = null;
      deleteBankName = "";
      fetchQuestionBanks();
    } catch (err) {
      console.error(err);
      showToast("❌ Error deleting question bank", "error");
    }
  });

  // Cancel delete
  cancelBtn.addEventListener("click", () => {
    deleteModal.style.display = "none";
    deleteBankId = null;
    deleteBankName = "";
  });

  // ===== Open delete modal with bank name =====
  window.deleteBank = function (id, name) {
    deleteBankId = id;
    deleteBankName = name;
    deleteMessage.textContent = `Are you sure you want to delete "${name}"?`;
    deleteModal.style.display = "flex";
  };

   // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  };
});

// ===== Global Edit Function =====
function editBank(id) {
  window.location.href = `/edit_bank/${id}`;
}

// ===== Placeholder View Function =====
function viewBank(id) {
  showToast("👁️ Viewing bank: " + id);
}
