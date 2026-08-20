"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [locForm, setLocForm] = useState({ name: "", latitude: "", longitude: "", radius: "" });
  const [editingId, setEditingId] = useState(null);

  const [schedule, setSchedule] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    checkIn: "09:00",
    checkOut: "17:00",
  });
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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
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
      loadLocations();
    }
  }

  function editLocation(loc) {
    setEditingId(loc.id);
    setLocForm({
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius: loc.radius,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setLocForm({ name: "", latitude: "", longitude: "", radius: "" });
  }

  async function deleteLocation(id) {
    if (!confirm("Hapus lokasi ini?")) return;
    const res = await fetch(`/api/admin/office-location/${id}`, { method: "DELETE" });
    const d = await res.json();
    setMsg(res.ok ? d.message : d.error);
    loadLocations();
  }

  async function saveSchedule(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/work-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    const d = await res.json();
    setMsg(res.ok ? "Jam kerja disimpan" : d.error);
  }

  async function handleDispensation(attendanceId, action) {
    await fetch("/api/admin/dispensation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, action }),
    });
    loadDispensations();
  }

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <header className="bg-[#0F1E33] border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B89C4] to-[#094D8C] flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <h1 className="text-base font-bold text-white">
            Simply HRIS <span className="text-[#0B89C4] font-medium">Admin</span>
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <a href="/admin/employees" className="text-sm text-slate-300 hover:text-white transition">
            Karyawan
          </a>
          <a href="/admin/payroll" className="text-sm text-slate-300 hover:text-white transition">
            Payroll
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {msg && (
          <div className="p-3 rounded-xl bg-[#0F1E33] border border-slate-800 text-slate-200 text-sm">{msg}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F1E33] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Lokasi Kantor (Pusat & Cabang)</h2>

            <form onSubmit={saveLocation} className="space-y-3">
              <input
                placeholder="Nama Lokasi (misal: Pusat, Cabang 1)"
                required
                value={locForm.name}
                onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
              <input
                placeholder="Latitude"
                required
                value={locForm.latitude}
                onChange={(e) => setLocForm({ ...locForm, latitude: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
              <input
                placeholder="Longitude"
                required
                value={locForm.longitude}
                onChange={(e) => setLocForm({ ...locForm, longitude: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
              <input
                placeholder="Radius (meter)"
                type="number"
                required
                value={locForm.radius}
                onChange={(e) => setLocForm({ ...locForm, radius: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0B89C4] to-[#094D8C] text-white text-sm font-medium hover:opacity-90 transition">
                  {editingId ? "Update Lokasi" : "Tambah Lokasi"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            <div className="pt-2 space-y-2">
              {locations.length === 0 && (
                <p className="text-slate-500 text-xs">Belum ada lokasi ditambahkan</p>
              )}
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex justify-between items-center bg-[#0A1628] border border-slate-800 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{loc.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Radius {loc.radius}m — {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editLocation(loc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteLocation(loc.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-900/50 text-red-300 text-xs hover:bg-red-900 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={saveSchedule} className="bg-[#0F1E33] border border-slate-800 rounded-2xl p-6 space-y-3 h-fit">
            <h2 className="text-white font-semibold">Jam Kerja Bulanan</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Bulan"
                value={schedule.month}
                onChange={(e) => setSchedule({ ...schedule, month: Number(e.target.value) })}
                className="px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
              <input
                type="number"
                placeholder="Tahun"
                value={schedule.year}
                onChange={(e) => setSchedule({ ...schedule, year: Number(e.target.value) })}
                className="px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs">Jam Masuk</label>
                <input
                  type="time"
                  value={schedule.checkIn}
                  onChange={(e) => setSchedule({ ...schedule, checkIn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs">Jam Pulang</label>
                <input
                  type="time"
                  value={schedule.checkOut}
                  onChange={(e) => setSchedule({ ...schedule, checkOut: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-[#0B89C4]"
                />
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0B89C4] to-[#094D8C] text-white text-sm font-medium hover:opacity-90 transition">
              Simpan Jam Kerja
            </button>
          </form>
        </div>

        <div className="bg-[#0F1E33] border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Persetujuan Dispensasi</h2>
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-500">
                <th className="py-2">Karyawan</th>
                <th className="py-2">Tanggal</th>
                <th className="py-2">Telat</th>
                <th className="py-2">Alasan</th>
                <th className="py-2">Bukti</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dispensations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-600">
                    Tidak ada pengajuan dispensasi
                  </td>
                </tr>
              )}
              {dispensations.map((d) => (
                <tr key={d.id} className="border-b border-slate-800/60">
                  <td className="py-3">{d.user.name}</td>
                  <td className="py-3">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="py-3">{d.lateMinutes} menit</td>
                  <td className="py-3 max-w-xs truncate">{d.dispensationReason}</td>
                  <td className="py-3">
                    {d.dispensationProofUrl ? (
                      
                      <a  href={d.dispensationProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B89C4] hover:underline text-xs"
                      >
                        Lihat Foto
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 space-x-2">
                    <button
                      onClick={() => handleDispensation(d.id, "ACCEPT")}
                      className="px-3 py-1 rounded-lg bg-emerald-900/50 text-emerald-300 text-xs hover:bg-emerald-900 transition"
                    >
                      ACCEPT
                    </button>
                    <button
                      onClick={() => handleDispensation(d.id, "REJECT")}
                      className="px-3 py-1 rounded-lg bg-red-900/50 text-red-300 text-xs hover:bg-red-900 transition"
                    >
                      REJECT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}