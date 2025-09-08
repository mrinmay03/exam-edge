document.addEventListener("DOMContentLoaded", () => {

  // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  };

  /* ===== Logout ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/auth/logout";
    });
  }

  /* ===== Load User Stats ===== */
  loadStats();
  setInterval(loadStats, 60000); // auto-refresh every 60s

  async function loadStats() {
    try {
      // Make sure the URL matches server.js
      const res = await fetch("/api/admin/user-stats"); // ← relative URL works better
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const stats = await res.json();

      // Update dashboard counts
      const totalUsersElem = document.getElementById("totalUsers");
      const activeUsersElem = document.getElementById("activeUsersToday");

      if (totalUsersElem) totalUsersElem.textContent = stats.totalUsers || 0;
      if (activeUsersElem) activeUsersElem.textContent = stats.activeUsersToday || 0;

    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }
});
