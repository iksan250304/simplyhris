"use client";

import { useState, useEffect } from "react";
import { loadFaceModels, getFaceDescriptorFromImage } from "@/lib/faceapi";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nik: "",
    baseSalary: "",
    allowance: "",
    bpjsPercent: "4",
    taxPercent: "5",
    officeLocationId: "",
  });
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [ktpDescriptor, setKtpDescriptor] = useState(null);
  const [faceMsg, setFaceMsg] = useState("");

  useEffect(() => {
    loadEmployees();
    loadLocations();
  }, []);

  async function loadEmployees() {
    const res = await fetch("/api/admin/employees");
    const d = await res.json();
    setEmployees(d.employees || []);
  }

  async function loadLocations() {
    const res = await fetch("/api/admin/office-location");
    const d = await res.json();
    setLocations(d.locations || []);
  }

  async function handleKtpChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setKtpFile(file);
    setKtpDescriptor(null);
    setFaceMsg("Mendeteksi wajah dari KTP...");

    const reader = new FileReader();
    reader.onload = async () => {
      setKtpPreview(reader.result);

      try {
        await loadFaceModels();
        const img = new Image();
        img.src = reader.result;
        await new Promise((res) => (img.onload = res));

        const descriptor = await getFaceDescriptorFromImage(img);
        if (!descriptor) {
          setFaceMsg("Wajah tidak terdeteksi di foto KTP, coba foto lain");
          setKtpDescriptor(null);
        } else {
          setFaceMsg("Wajah terdeteksi ✓");
          setKtpDescriptor(descriptor);
        }
      } catch (err) {
        setFaceMsg("Gagal memuat model deteksi wajah");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!ktpFile) {
      setMsg("Foto KTP wajib diupload");
      return;
    }

    if (!ktpDescriptor) {
      setMsg("Wajah di KTP belum terverifikasi, tunggu proses deteksi selesai atau ganti foto");
      return;
    }

    if (!form.officeLocationId) {
      setMsg("Lokasi penempatan wajib dipilih");
      return;
    }

    setLoading(true);
    try {
      const ktpPhotoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(ktpFile);
      });

      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ktpPhotoBase64, faceEmbedding: ktpDescriptor }),
      });
      const d = await res.json();

      if (!res.ok) {
        setMsg(d.error);
        setLoading(false);
        return;
      }

      setMsg("Karyawan berhasil didaftarkan");
      setForm({
        name: "",
        email: "",
        password: "",
        nik: "",
        baseSalary: "",
        allowance: "",
        bpjsPercent: "4",
        taxPercent: "5",
        officeLocationId: "",
      });
      setKtpFile(null);
      setKtpPreview(null);
      setKtpDescriptor(null);
      setFaceMsg("");
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setMsg("Terjadi kesalahan");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus karyawan ini?")) return;
    await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    loadEmployees();
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-white">
          Simply HRIS <span className="text-red-500">Admin</span>
        </h1>
        <a href="/admin/dashboard" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </a>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Registrasi Karyawan</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800"
          >
            {showForm ? "Tutup Form" : "+ Tambah Karyawan"}
          </button>
        </div>

        {msg && <div className="p-3 rounded-lg bg-slate-800 text-slate-200 text-sm">{msg}</div>}

        {locations.length === 0 && (
          <div className="p-3 rounded-lg bg-yellow-900 text-yellow-300 text-sm">
            Belum ada lokasi kantor. Tambahkan lokasi dulu di Dashboard sebelum registrasi karyawan.
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Nama Lengkap"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="Password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="NIK KTP"
                required
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <select
                required
                value={form.officeLocationId}
                onChange={(e) => setForm({ ...form, officeLocationId: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm md:col-span-2"
              >
                <option value="">Pilih Lokasi Penempatan</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Gaji Pokok"
                type="number"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="Tunjangan"
                type="number"
                value={form.allowance}
                onChange={(e) => setForm({ ...form, allowance: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="BPJS (%)"
                type="number"
                step="0.1"
                value={form.bpjsPercent}
                onChange={(e) => setForm({ ...form, bpjsPercent: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
              <input
                placeholder="PPh 21 (%)"
                type="number"
                step="0.1"
                value={form.taxPercent}
                onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-2">Foto KTP</label>
              <input type="file" accept="image/*" onChange={handleKtpChange} className="text-sm text-slate-300" />
              {faceMsg && (
                <p className={`text-xs mt-2 ${ktpDescriptor ? "text-green-500" : "text-yellow-500"}`}>
                  {faceMsg}
                </p>
              )}
              {ktpPreview && (
                <img src={ktpPreview} alt="Preview KTP" className="mt-3 max-h-40 rounded-lg border border-slate-700" />
              )}
            </div>

            <button
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-red-700 text-white font-medium hover:bg-red-800 disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Daftarkan Karyawan"}
            </button>
          </form>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Daftar Karyawan ({employees.length})</h2>
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-500">
                <th className="py-2">Foto KTP</th>
                <th className="py-2">Nama</th>
                <th className="py-2">Email</th>
                <th className="py-2">NIK</th>
                <th className="py-2">Lokasi</th>
                <th className="py-2">Gaji Pokok</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-600">
                    Belum ada karyawan terdaftar
                  </td>
                </tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-800">
                  <td className="py-2">
                    {emp.ktpPhotoUrl ? (
                      <img src={emp.ktpPhotoUrl} alt="KTP" className="w-12 h-8 object-cover rounded" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2">{emp.name}</td>
                  <td className="py-2">{emp.email}</td>
                  <td className="py-2">{emp.nik}</td>
                  <td className="py-2">{emp.officeLocation?.name || "-"}</td>
                  <td className="py-2">
                    Rp {emp.baseSalary ? Number(emp.baseSalary).toLocaleString("id-ID") : 0}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="px-3 py-1 rounded bg-red-700 text-white text-xs hover:bg-red-800"
                    >
                      Hapus
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