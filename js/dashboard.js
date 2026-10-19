// Logika dashboard: greeting berdasarkan jam lokal, jam, dan modal laporan

const user = requireLogin();

function getGreeting(hour) {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function updateClock() {
  const now = new Date();
  document.getElementById("greeting").textContent = getGreeting(now.getHours()) + ", " + user.nama + "!";
  document.getElementById("clockTime").textContent = now.toLocaleTimeString("id-ID");
  document.getElementById("clockDate").textContent = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ---------- Laporan ----------
function buildTable(headers, rows) {
  const head = headers.map((h) => "<th>" + h + "</th>").join("");
  const body = rows.map((r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>").join("");
  return "<table><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table>";
}

const laporan = {
  monitoring: {
    judul: "Monitoring Progress DO Bahan Ajar",
    render() {
      const rows = Object.values(dataTracking).map((d) => [
        escapeHTML(d.nomorDO),
        escapeHTML(d.nama),
        escapeHTML(d.ekspedisi),
        escapeHTML(d.tanggalKirim),
        '<span class="badge badge-info">' + escapeHTML(d.status) + "</span>",
      ]);
      return buildTable(["No. DO", "Nama", "Ekspedisi", "Tgl Kirim", "Status"], rows);
    },
  },
  rekap: {
    judul: "Rekap Bahan Ajar",
    render() {
      const total = dataBahanAjar.reduce((sum, b) => sum + b.stok, 0);
      const rows = dataBahanAjar.map((b) => [
        escapeHTML(b.kodeBarang), escapeHTML(b.namaBarang), escapeHTML(b.jenisBarang), b.stok,
      ]);
      rows.push(["", "<strong>Total (" + dataBahanAjar.length + " judul)</strong>", "", "<strong>" + total + "</strong>"]);
      return buildTable(["Kode", "Nama Barang", "Jenis", "Stok"], rows);
    },
  },
  histori: {
    judul: "Histori Transaksi Bahan Ajar",
    render() {
      const rows = [];
      Object.values(dataTracking).forEach((d) => {
        d.perjalanan.forEach((p) => rows.push([escapeHTML(p.waktu), escapeHTML(d.nomorDO), escapeHTML(p.keterangan)]));
      });
      rows.sort((a, b) => (a[0] < b[0] ? 1 : -1));
      return buildTable(["Waktu", "No. DO", "Keterangan"], rows);
    },
  },
};

function showLaporan(key) {
  const item = laporan[key];
  if (!item) return;
  document.getElementById("laporanJudul").textContent = item.judul;
  document.getElementById("laporanIsi").innerHTML = item.render();
  openModal("modalLaporan");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!user) return;
  document.getElementById("userInfo").textContent = user.role + " • " + user.lokasi;
  updateClock();
  setInterval(updateClock, 1000);

  document.querySelectorAll("[data-laporan]").forEach((btn) => {
    btn.addEventListener("click", () => showLaporan(btn.dataset.laporan));
  });

  // Dibuka dari menu navbar halaman lain: dashboard.html?laporan=rekap
  const key = new URLSearchParams(window.location.search).get("laporan");
  if (key) showLaporan(key);
});
