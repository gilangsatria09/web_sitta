// Logika halaman login: validasi, autentikasi, modal Lupa Password & Daftar

const REGISTERED_KEY = "sittaRegistered";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pengguna dari data.js + pengguna yang mendaftar lewat form (disimpan di localStorage)
function getAllUsers() {
  let extra = [];
  try {
    extra = JSON.parse(localStorage.getItem(REGISTERED_KEY)) || [];
  } catch (e) {
    extra = [];
  }
  return dataPengguna.concat(extra);
}

function validateEmail(input) {
  const value = input.value.trim();
  if (!value) {
    setFieldError(input, "Email wajib diisi.");
    return false;
  }
  if (!EMAIL_PATTERN.test(value)) {
    setFieldError(input, "Format email tidak valid.");
    return false;
  }
  setFieldError(input, "");
  return true;
}

function validateRequired(input, label) {
  if (!input.value.trim()) {
    setFieldError(input, label + " wajib diisi.");
    return false;
  }
  setFieldError(input, "");
  return true;
}

// ---------- Login ----------
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  const okEmail = validateEmail(emailInput);
  const okPass = validateRequired(passInput, "Password");
  if (!okEmail || !okPass) return;

  const email = emailInput.value.trim().toLowerCase();
  const user = getAllUsers().find((u) => u.email.toLowerCase() === email && u.password === passInput.value);

  if (!user) {
    alert("Email/password yang anda masukkan salah");
    passInput.value = "";
    passInput.focus();
    return;
  }

  // Password tidak disimpan di session
  const { password, ...safeUser } = user;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  window.location.href = "dashboard.html";
});

// ---------- Lupa Password ----------
document.getElementById("btnLupa").addEventListener("click", () => openModal("modalLupa"));

document.getElementById("formLupa").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("lupaEmail");
  if (!validateEmail(input)) return;

  const found = getAllUsers().some((u) => u.email.toLowerCase() === input.value.trim().toLowerCase());
  if (!found) {
    setFieldError(input, "Email tidak terdaftar di SITTA.");
    return;
  }
  closeModal("modalLupa");
  e.target.reset();
  showToast("Tautan reset password telah dikirim ke email Anda.", "success");
});

// ---------- Daftar ----------
document.getElementById("btnDaftar").addEventListener("click", () => openModal("modalDaftar"));

document.getElementById("formDaftar").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = document.getElementById("daftarNama");
  const email = document.getElementById("daftarEmail");
  const role = document.getElementById("daftarRole");
  const lokasi = document.getElementById("daftarLokasi");
  const pass = document.getElementById("daftarPassword");
  const konfirmasi = document.getElementById("daftarKonfirmasi");

  let valid = validateRequired(nama, "Nama");
  valid = validateEmail(email) && valid;
  valid = validateRequired(lokasi, "Lokasi") && valid;

  if (pass.value.length < 6) {
    setFieldError(pass, "Password minimal 6 karakter.");
    valid = false;
  } else {
    setFieldError(pass, "");
  }
  if (konfirmasi.value !== pass.value) {
    setFieldError(konfirmasi, "Password tidak sama.");
    valid = false;
  } else {
    setFieldError(konfirmasi, "");
  }

  if (valid && getAllUsers().some((u) => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
    setFieldError(email, "Email sudah terdaftar.");
    valid = false;
  }
  if (!valid) return;

  const extra = getAllUsers().slice(dataPengguna.length);
  extra.push({
    id: dataPengguna.length + extra.length + 1,
    nama: nama.value.trim(),
    email: email.value.trim().toLowerCase(),
    password: pass.value,
    role: role.value,
    lokasi: lokasi.value.trim(),
  });
  try {
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(extra));
  } catch (err) {
    // penyimpanan tidak tersedia; akun hanya berlaku sampai halaman dimuat ulang
  }

  closeModal("modalDaftar");
  e.target.reset();
  showToast("Pendaftaran berhasil. Silakan login.", "success");
});
