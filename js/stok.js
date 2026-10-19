// Logika halaman stok: render tabel dari dataBahanAjar, pencarian, dan tambah baris lewat DOM

requireLogin();

const STOK_MENIPIS = 200;
const tbody = document.getElementById("tabelStok");

function createCell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function createRow(item) {
  const tr = document.createElement("tr");

  const coverCell = document.createElement("td");
  const img = document.createElement("img");
  img.className = "cover";
  img.src = item.cover || "";
  img.alt = "Cover " + item.namaBarang;
  img.addEventListener("error", () => img.removeAttribute("src"));
  coverCell.appendChild(img);
  tr.appendChild(coverCell);

  tr.appendChild(createCell(item.kodeLokasi));
  tr.appendChild(createCell(item.kodeBarang));
  tr.appendChild(createCell(item.namaBarang));
  tr.appendChild(createCell(item.jenisBarang));
  tr.appendChild(createCell(item.edisi));

  const stokCell = createCell("", "num");
  stokCell.textContent = item.stok + " ";
  const badge = document.createElement("span");
  const menipis = item.stok < STOK_MENIPIS;
  badge.className = "badge " + (menipis ? "badge-warn" : "badge-ok");
  badge.textContent = menipis ? "Menipis" : "Aman";
  stokCell.appendChild(badge);
  tr.appendChild(stokCell);

  return tr;
}

function renderTable(list) {
  tbody.innerHTML = "";
  list.forEach((item) => tbody.appendChild(createRow(item)));
  document.getElementById("kosong").hidden = list.length > 0;

  const total = list.reduce((sum, b) => sum + Number(b.stok), 0);
  document.getElementById("ringkasan").textContent =
    "Menampilkan " + list.length + " dari " + dataBahanAjar.length + " judul • Total stok: " + total;
}

function applyFilter() {
  const q = document.getElementById("cari").value.trim().toLowerCase();
  renderTable(
    dataBahanAjar.filter((b) => (b.kodeBarang + " " + b.namaBarang + " " + b.kodeLokasi).toLowerCase().includes(q))
  );
}

document.getElementById("cari").addEventListener("input", applyFilter);

// ---------- Tambah stok ----------
const form = document.getElementById("formTambah");
document.getElementById("btnTambah").addEventListener("click", () => {
  form.reset();
  form.querySelectorAll("input, select").forEach((el) => setFieldError(el, ""));
  openModal("modalTambah");
  document.getElementById("fKodeLokasi").focus();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const kodeLokasi = document.getElementById("fKodeLokasi");
  const kodeBarang = document.getElementById("fKodeBarang");
  const nama = document.getElementById("fNama");
  const edisi = document.getElementById("fEdisi");
  const stok = document.getElementById("fStok");

  let valid = true;
  [[kodeLokasi, "Kode lokasi"], [kodeBarang, "Kode barang"], [nama, "Nama barang"]].forEach(([el, label]) => {
    if (!el.value.trim()) {
      setFieldError(el, label + " wajib diisi.");
      valid = false;
    } else {
      setFieldError(el, "");
    }
  });

  if (!/^[1-9]\d*$/.test(edisi.value)) {
    setFieldError(edisi, "Edisi harus bilangan bulat ≥ 1.");
    valid = false;
  } else {
    setFieldError(edisi, "");
  }
  if (!/^\d+$/.test(stok.value)) {
    setFieldError(stok, "Stok harus bilangan bulat ≥ 0.");
    valid = false;
  } else {
    setFieldError(stok, "");
  }

  const kode = kodeBarang.value.trim().toUpperCase();
  const lokasi = kodeLokasi.value.trim().toUpperCase();
  if (valid && dataBahanAjar.some((b) => b.kodeBarang === kode && b.kodeLokasi === lokasi)) {
    setFieldError(kodeBarang, "Kode barang ini sudah ada di lokasi tersebut.");
    valid = false;
  }
  if (!valid) return;

  const item = {
    kodeLokasi: lokasi,
    kodeBarang: kode,
    namaBarang: nama.value.trim(),
    jenisBarang: document.getElementById("fJenis").value,
    edisi: edisi.value,
    stok: Number(stok.value),
    cover: "",
  };
  dataBahanAjar.push(item);
  document.getElementById("cari").value = "";
  renderTable(dataBahanAjar);

  closeModal("modalTambah");
  showToast("Stok \"" + item.namaBarang + "\" berhasil ditambahkan.", "success");
});

renderTable(dataBahanAjar);
