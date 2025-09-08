document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();

      if (res.ok) {
        messageEl.textContent = "Login successful! Redirecting...";
        messageEl.className = "message success";
        messageEl.style.display = "block";
        setTimeout(() => { window.location.href = data.redirect; }, 1500);
      } else {
        messageEl.textContent = data.msg || "Invalid credentials!";
        messageEl.className = "message error";
        messageEl.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Something went wrong!";
      messageEl.className = "message error";
      messageEl.style.display = "block";
    }
  });
});
