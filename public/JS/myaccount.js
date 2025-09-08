document.addEventListener("DOMContentLoaded", async () => {
  async function loadUser() {
    try {
      const res = await fetch("/auth/user", {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const sidebarUsername = document.getElementById("sidebar-username");
        if (sidebarUsername) {
          const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          sidebarUsername.innerText = `${capitalize(data.user.firstName)} ${capitalize(data.user.lastName)}`;
        }
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
    }
  }

  loadUser();

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      contents.forEach(c => c.style.display = c.id === target ? "block" : "none");
    });
  });

  // Fetch user data for personal info
  const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
  };

  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const messageEl = document.getElementById("message");
  const form = document.getElementById("accountForm");

  let originalData = null;

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  try {
    const res = await fetch("/auth/user", { credentials: "include" });
    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    const user = data.user;
    originalData = user;

    fields.firstName.value = capitalize(user.firstName);
    fields.lastName.value = capitalize(user.lastName);
    fields.phone.value = user.phone || "-";
    fields.email.value = user.email;
  } catch (err) {
    console.error(err);
    alert("You must be logged in to view your account.");
    window.location.href = "/login";
  }

  // Enable editing
  editBtn.addEventListener("click", () => {
    [fields.firstName, fields.lastName, fields.phone, fields.email].forEach(f => f.disabled = false);
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
  });

  // Cancel editing
  cancelBtn.addEventListener("click", () => {
    if (originalData) {
      fields.firstName.value = capitalize(originalData.firstName);
      fields.lastName.value = capitalize(originalData.lastName);
      fields.phone.value = originalData.phone || "-";
      fields.email.value = originalData.email;
    }
    [fields.firstName, fields.lastName, fields.phone, fields.email].forEach(f => f.disabled = true);
    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
  });

  // Save changes
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim()
    };

    try {
      const res = await fetch("/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      messageEl.textContent = data.msg;
      messageEl.style.color = res.ok ? "green" : "red";

      if (res.ok) {
        originalData = { ...originalData, ...updated };
        [fields.firstName, fields.lastName, fields.phone, fields.email].forEach(f => f.disabled = true);
        editBtn.style.display = "inline-block";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
      }
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Update failed!";
      messageEl.style.color = "red";
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => window.location.href = "/auth/logout");
  }

  // Change password form
  const passwordForm = document.getElementById("passwordForm");
  const passwordMessage = document.getElementById("passwordMessage");

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        passwordMessage.textContent = "New passwords do not match!";
        passwordMessage.style.color = "red";
        return;
      }

      try {
        const res = await fetch("/auth/change-password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        passwordMessage.textContent = data.msg;
        passwordMessage.style.color = res.ok ? "green" : "red";

        if (res.ok) passwordForm.reset();
      } catch (err) {
        console.error(err);
        passwordMessage.textContent = "Something went wrong!";
        passwordMessage.style.color = "red";
      }
    });
  }
    // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  };
});
