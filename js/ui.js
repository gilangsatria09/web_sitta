// Helper UI bersama: modal, toast, escape HTML, session

const SESSION_KEY = "sittaUser";

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

// Halaman selain login hanya boleh dibuka setelah login
function requireLogin() {
  const user = getSession();
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.textContent = user.nama + " (" + user.role + ")";
  return user;
}

function logout() {
  if (confirm("Yakin ingin keluar dari SITTA?")) {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  }
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function showToast(message, type) {
  let stack = document.getElementById("toastStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = "toast " + (type || "");
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Tandai field valid/tidak valid + pesan error di bawahnya
function setFieldError(input, message) {
  input.classList.toggle("invalid", Boolean(message));
  const err = input.parentElement.querySelector(".error-text");
  if (err) err.textContent = message || "";
}

document.addEventListener("DOMContentLoaded", () => {
  // Tombol tutup & klik di luar kotak menutup modal; Esc juga menutup
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal-close")) {
        modal.classList.remove("open");
      }
    });
  });
  // Dropdown navbar: klik untuk buka/tutup (layar sentuh), klik di luar menutup
  document.querySelectorAll(".dropdown .drop-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.parentElement.classList.toggle("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown.open").forEach((d) => d.classList.remove("open"));
  });
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.open, .dropdown.open").forEach((m) => m.classList.remove("open"));
  }
});
