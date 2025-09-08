document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const messageEl = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const phone = document.getElementById("phone").value.trim(); // ✅ added phone
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, password })
      });

      const data = await res.json();
      messageEl.textContent = data.msg;

      if (res.ok) {
        messageEl.style.color = "green";
        form.reset();
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      } else {
        messageEl.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Something went wrong!";
      messageEl.style.color = "red";
    }
  });
});
