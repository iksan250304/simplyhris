"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";

const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function AdminDashboardPage() {
  const [locations, setLocations] = useState([]);
  const [locForm, setLocForm] = useState({ name: "", latitude: "", longitude: "", radius: "" });
  const [editingId, setEditingId] = useState(null);
  const [showLocForm, setShowLocForm] = useState(false);

  const [schedule, setSchedule] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    checkIn: "08:00",
    checkOut: "17:00",
  });
  const [savedSchedule, setSavedSchedule] = useState(false);

  const [dispensations, setDispensations] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadLocations();
    loadSchedule(schedule.month, schedule.year);
    loadDispensations();
  }, []);

  async function loadLocations() {
    const res = await fetch("/api/admin/office-location");
    const d = await res.json();
    setLocations(d.locations || []);
  }

  async function loadSchedule(month, year) {
    const res = await fetch(`/api/admin/work-schedule?month=${month}&year=${year}`);
    const d = await res.json();
    if (d.schedule) setSchedule(d.schedule);
  }

  async function loadDispensations() {
    const res = await fetch("/api/admin/dispensation");
    const d = await res.json();
    setDispensations(d.dispensations || []);
  }

  async function saveLocation(e) {
    e.preventDefault();
    const url = editingId ? `/api/admin/office-location/${editingId}` : "/api/admin/office-location";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locForm),
    });
    const d = await res.json();
    setMsg(res.ok ? d.message : d.error);
    if (res.ok) {
      setLocForm({ name: "", latitude: "", longitude: "", radius: "" });
      setEditingId(null);
      setShowLocForm(false);
      loadLocations();
    }
  }

  function startEdit(loc) {
    setEditingId(loc.id);
    setLocForm({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude, radius: loc.radius });
    setShowLocForm(true);
  }

  function cancelLocForm() {
    setEditingId(null);
    setLocForm({ name: "", latitude: "", longitude: "", radius: "" });
    setShowLocForm(false);
  }

  async function deleteLocation(id) {
    if (!confirm("Hapus lokasi ini?")) return;
    const res = await fetch(`/api/admin/office-location/${id}`, { method: "DELETE" });
    const d = await res.json();
    setMsg(res.ok ? d.message : d.error);
    loadLocations();
  }

  async function saveSchedule() {
    const res = await fetch("/api/admin/work-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    const d = await res.json();
    if (res.ok) {
      setSavedSchedule(true);
      setTimeout(() => setSavedSchedule(false), 2500);
    } else {
      setMsg(d.error);
    }
  }

  async function handleDispensation(attendanceId, action) {
    await fetch("/api/admin/dispensation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, action }),
    });
    loadDispensations();
  }

  const durasi = (() => {
    const [hm, hh] = schedule.checkIn.split(":").map(Number);
    const [pm, ph] = schedule.checkOut.split(":").map(Number);
    const total = pm * 60 + ph - (hm * 60 + hh);
    return total > 0 ? `${Math.floor(total / 60)}j ${total % 60}m` : "--";
  })();

  const pendingCount = dispensations.filter((d) => d.dispensationStatus === "PENDING").length;

  return (
    <div className="grad-bg min-h-screen">
      <AdminNavbar />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          {msg && (
            <div className="admin-card py-3 text-sm" style={{ color: "#2a3f52" }}>
              {msg}
            </div>
          )}

          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>
            {/* LEFT: Lokasi Kantor */}
            <div className="admin-card flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-slate-800">Lokasi Kantor</h2>
                  <p className="text-xs mt-0.5" style={{ color: "#5a7d96" }}>Pusat & Cabang</p>
                </div>
                <button
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: showLocForm ? "rgba(11,137,196,0.2)" : "rgba(11,137,196,0.1)", color: "#0873a8", border: "1px solid rgba(11,137,196,0.25)" }}
                  onClick={() => (showLocForm ? cancelLocForm() : setShowLocForm(true))}
                >
                  {showLocForm ? "Batal" : "+ Tambah Lokasi"}
                </button>
              </div>

              {showLocForm && (
                <form onSubmit={saveLocation} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#f0f6fb", border: "1px solid #dde8f0" }}>
                  <p className="text-xs font-semibold" style={{ color: "#0873a8" }}>{editingId ? "Edit Lokasi" : "Tambah Lokasi Baru"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs mb-1" style={{ color: "#6a8faa" }}>Nama Lokasi</label>
                      <input className="admin-input" placeholder="cth. Kantor Pusat Jakarta" value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#6a8faa" }}>Latitude</label>
                      <input className="admin-input" placeholder="-6.2088" value={locForm.latitude} onChange={(e) => setLocForm({ ...locForm, latitude: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#6a8faa" }}>Longitude</label>
                      <input className="admin-input" placeholder="106.8456" value={locForm.longitude} onChange={(e) => setLocForm({ ...locForm, longitude: e.target.value })} required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs mb-1" style={{ color: "#6a8faa" }}>Radius (meter)</label>
                      <input className="admin-input" type="number" placeholder="100" value={locForm.radius} onChange={(e) => setLocForm({ ...locForm, radius: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="admin-btn-primary self-end text-sm px-5 py-2">
                    {editingId ? "Simpan Perubahan" : "Tambah Lokasi"}
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-2">
                {locations.length === 0 && <p className="text-xs" style={{ color: "#5a7d96" }}>Belum ada lokasi ditambahkan</p>}
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between rounded-xl px-4 py-3 group" style={{ background: "#f0f6fb", border: "1px solid #dde8f0" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(11,137,196,0.2)", color: "#0B89C4" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M12 21s-7-6.75-7-11a7 7 0 1114 0c0 4.25-7 11-7 11z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-800">{loc.name}</span>
                        <p className="text-xs mt-0.5 mono" style={{ color: "#5a7d96" }}>
                          {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)} · r={loc.radius}m
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(loc)} className="text-xs px-3 py-1 rounded-lg font-medium transition-all" style={{ background: "rgba(11,137,196,0.1)", color: "#0873a8", border: "1px solid rgba(11,137,196,0.2)" }}>
                        Edit
                      </button>
                      <button onClick={() => deleteLocation(loc.id)} className="text-xs px-3 py-1 rounded-lg font-medium transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Jam Kerja Bulanan */}
            <div className="admin-card flex flex-col gap-5">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-800">Jam Kerja Bulanan</h2>
                <p className="text-xs mt-0.5" style={{ color: "#5a7d96" }}>Konfigurasi jadwal kerja</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Bulan</label>
                    <select className="admin-input" value={schedule.month} onChange={(e) => setSchedule({ ...schedule, month: Number(e.target.value) })}>
                      {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Tahun</label>
                    <input className="admin-input" type="number" value={schedule.year} onChange={(e) => setSchedule({ ...schedule, year: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="h-px" style={{ background: "#dde8f0" }} />

                <div className="rounded-xl p-3 flex flex-col gap-3" style={{ background: "#f0f6fb", border: "1px solid #dde8f0" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "#6a8faa" }}>Jam Masuk</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                      <span className="text-xs font-medium" style={{ color: "#10b981" }}>Masuk</span>
                    </div>
                  </div>
                  <input type="time" className="admin-input text-center text-lg font-semibold mono" value={schedule.checkIn} onChange={(e) => setSchedule({ ...schedule, checkIn: e.target.value })} />
                </div>

                <div className="rounded-xl p-3 flex flex-col gap-3" style={{ background: "#f0f6fb", border: "1px solid #dde8f0" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "#6a8faa" }}>Jam Pulang</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ef4444" }} />
                      <span className="text-xs font-medium" style={{ color: "#ef4444" }}>Pulang</span>
                    </div>
                  </div>
                  <input type="time" className="admin-input text-center text-lg font-semibold mono" value={schedule.checkOut} onChange={(e) => setSchedule({ ...schedule, checkOut: e.target.value })} />
                </div>

                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ background: "rgba(11,137,196,0.08)", border: "1px solid rgba(11,137,196,0.15)" }}>
                  <span className="text-xs" style={{ color: "#5a7d96" }}>Durasi kerja</span>
                  <span className="text-sm font-semibold mono" style={{ color: "#0873a8" }}>{durasi}</span>
                </div>

                <button className="admin-btn-primary w-full text-sm py-2.5" onClick={saveSchedule}>
                  {savedSchedule ? "Tersimpan!" : "Simpan Jadwal"}
                </button>
              </div>
            </div>
          </div>

          {/* Persetujuan Dispensasi */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-800">Persetujuan Dispensasi</h2>
                <p className="text-xs mt-0.5" style={{ color: "#5a7d96" }}>{pendingCount} pengajuan menunggu persetujuan</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #dde8f0" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Tanggal</th>
                    <th>Telat</th>
                    <th>Alasan</th>
                    <th>Bukti</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6" style={{ color: "#9ab0c4" }}>
                        Tidak ada pengajuan dispensasi
                      </td>
                    </tr>
                  )}
                  {dispensations.map((d) => {
                    const initials = d.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #0B89C4, #094D8C)", color: "white" }}>
                              {initials}
                            </div>
                            <span className="font-medium text-slate-800 text-sm">{d.user.name}</span>
                          </div>
                        </td>
                        <td className="mono" style={{ color: "#6a8faa", fontSize: 12 }}>
                          {new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold mono"
                            style={{
                              background: d.lateMinutes > 30 ? "rgba(239,68,68,0.15)" : d.lateMinutes > 15 ? "rgba(245,158,11,0.15)" : "rgba(11,137,196,0.15)",
                              color: d.lateMinutes > 30 ? "#ef4444" : d.lateMinutes > 15 ? "#f59e0b" : "#3BA7D9",
                            }}
                          >
                            {d.lateMinutes} mnt
                          </span>
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <span className="text-sm" style={{ color: "#2a3f52" }}>{d.dispensationReason}</span>
                        </td>
                        <td>
                          {d.dispensationProofUrl ? (
                            <a href={d.dispensationProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: "rgba(11,137,196,0.1)", color: "#0873a8", border: "1px solid rgba(11,137,196,0.2)" }}>
                              Lihat
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: "#9ab0c4" }}>-</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => handleDispensation(d.id, "ACCEPT")} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                              Terima
                            </button>
                            <button onClick={() => handleDispensation(d.id, "REJECT")} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}