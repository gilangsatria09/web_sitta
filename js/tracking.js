// Logika tracking pengiriman: cari nomor DO, tampilkan detail, progress bar, dan timeline

requireLogin();

const TAHAPAN = ["Diproses", "Dikirim", "Dalam Perjalanan", "Diterima"];

// Posisi tahap berdasarkan status; "Selesai Antar" pada perjalanan terakhir berarti sudah diterima
function getStepIndex(data) {
  const last = data.perjalanan[data.perjalanan.length - 1];
  if (last && /^selesai antar/i.test(last.keterangan)) return TAHAPAN.length - 1;
  const idx = TAHAPAN.indexOf(data.status);
  return idx === -1 ? 0 : idx;
}

function badgeClass(step) {
  if (step === TAHAPAN.length - 1) return "badge-ok";
  return step === 0 ? "badge-warn" : "badge-info";
}

function renderResult(data) {
  const step = getStepIndex(data);
  const percent = ((step + 1) / TAHAPAN.length) * 100;

  document.getElementById("hNama").textContent = data.nama;
  document.getElementById("hDO").textContent = data.nomorDO;

  const status = document.getElementById("hStatus");
  status.textContent = TAHAPAN[step];
  status.className = "badge " + badgeClass(step);

  const bar = document.getElementById("progressBar");
  bar.classList.toggle("done", step === TAHAPAN.length - 1);
  bar.style.width = "0";
  requestAnimationFrame(() => { bar.style.width = percent + "%"; });
  document.getElementById("progress").setAttribute("aria-valuenow", percent);

  document.getElementById("steps").innerHTML = TAHAPAN
    .map((t, i) => '<span class="' + (i <= step ? "on" : "") + '">' + t + "</span>")
    .join("");

  document.getElementById("dEkspedisi").textContent = data.ekspedisi;
  document.getElementById("dTanggal").textContent = new Date(data.tanggalKirim).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const lokasi = dataBahanAjar.find((b) => b.kodeLokasi === data.paket);
  document.getElementById("dPaket").textContent = lokasi ? data.paket + " – " + lokasi.namaBarang : data.paket;
  document.getElementById("dTotal").textContent = data.total;

  // Terbaru di atas
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";
  data.perjalanan
    .slice()
    .sort((a, b) => (a.waktu < b.waktu ? 1 : -1))
    .forEach((p) => {
      const li = document.createElement("li");
      const time = document.createElement("time");
      time.textContent = p.waktu;
      li.appendChild(time);
      li.appendChild(document.createTextNode(p.keterangan));
      timeline.appendChild(li);
    });

  document.getElementById("hasil").hidden = false;
}

document.getElementById("trackingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("nomorDO");
  const error = document.getElementById("doError");
  const nomor = input.value.trim();
  const hasil = document.getElementById("hasil");

  hasil.hidden = true;
  input.classList.remove("invalid");
  error.textContent = "";

  if (!nomor) {
    input.classList.add("invalid");
    error.textContent = "Nomor Delivery Order wajib diisi.";
    return;
  }
  if (!/^\d+$/.test(nomor)) {
    input.classList.add("invalid");
    error.textContent = "Nomor DO hanya boleh berisi angka.";
    return;
  }

  const data = dataTracking[nomor];
  if (!data) {
    input.classList.add("invalid");
    error.textContent = "Nomor DO " + nomor + " tidak ditemukan.";
    alert("Data pengiriman dengan nomor DO " + nomor + " tidak ditemukan.");
    return;
  }
  renderResult(data);
});
