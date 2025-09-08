document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#usersTable tbody");
  let usersData = [];

  // ✅ Capitalize helper
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ✅ Date formatter (dd-mm-yyyy)
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  try {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    usersData = await res.json();
    renderTable(usersData);
  } catch (err) {
    console.error(err);
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach((user, index) => {
      const fullName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${fullName}</td>
        <td>${user.email}</td>
        <td>${user.phone || "-"}</td>
        <td>${capitalize(user.role)}</td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <button class="btn-edit" onclick="editUser('${user._id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-delete" onclick="deleteUser('${user._id}')"><i class="fas fa-trash"></i> Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Search functionality
  window.searchTable = function() {
    const query = document.getElementById("searchUser").value.toLowerCase();
    const filtered = usersData.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone || "").includes(query) ||
      user.role.toLowerCase().includes(query)
    );
    renderTable(filtered);
  }

  // Table sorting
  const headers = document.querySelectorAll("#usersTable th");
  headers.forEach((th, index) => {
    if (index === 6) return; // Skip Actions column
    th.style.cursor = "pointer";
    th.addEventListener("click", () => sortTable(index));
  });

  function sortTable(colIndex) {
    const sorted = [...usersData].sort((a, b) => {
      let valA, valB;
      switch(colIndex) {
        case 0: valA = a._id; valB = b._id; break;
        case 1: valA = `${capitalize(a.firstName)} ${capitalize(a.lastName)}`;
                valB = `${capitalize(b.firstName)} ${capitalize(b.lastName)}`;
                break;
        case 2: valA = a.email; valB = b.email; break;
        case 3: valA = a.phone || ""; valB = b.phone || ""; break;
        case 4: valA = capitalize(a.role); valB = capitalize(b.role); break;
        case 5: valA = new Date(a.createdAt); valB = new Date(b.createdAt); break;
      }
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });
    renderTable(sorted);
  }
      // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
  };
});

// Delete function
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    alert(data.msg);
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Error deleting user!");
  }
}

// Edit function
function editUser(id) {
  alert("Edit functionality coming soon for user ID: " + id);
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "/auth/logout";
  });
}
