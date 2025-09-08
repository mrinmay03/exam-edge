document.addEventListener("DOMContentLoaded", () => {
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

    /* ===== Logout ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // ✅ Redirect directly to GET /auth/logout (server will destroy session & redirect to /login?msg=...)
      window.location.href = "/auth/logout";
    });
  }

  // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  };
});
