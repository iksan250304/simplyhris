"use client";

import { useState, useEffect, useRef } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { loadFaceModels, getFaceDescriptorFromImage } from "@/lib/faceapi";

function fmt(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", nik: "", officeLocationId: "",
    baseSalary: "", allowance: "", bpjsPercent: "2", taxPercent: "5",
  });
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [ktpDescriptor, setKtpDescriptor] = useState(null);
  const [faceStatus, setFaceStatus] = useState(null); // 'detecting' | 'found' | 'notfound'
  const fileRef = useRef(null);

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

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setKtpFile(file);
    setKtpDescriptor(null);
    setFaceStatus("detecting");

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
          setFaceStatus("notfound");
          setKtpDescriptor(null);
        } else {
          setFaceStatus("found");
          setKtpDescriptor(descriptor);
        }
      } catch (err) {
        setFaceStatus("notfound");
      }
    };
    reader.readAsDataURL(file);
  }

  const estimasi = form.baseSalary
    ? Number(form.baseSalary) + Number(form.allowance || 0) - (Number(form.baseSalary) * Number(form.bpjsPercent || 0)) / 100 - (Number(form.baseSalary) * Number(form.taxPercent || 0)) / 100
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!ktpFile) {
      setMsg("Foto KTP wajib diupload");
      return;
    }
    if (!ktpDescriptor) {
      setMsg("Wajah di KTP belum terverifikasi");
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
      setForm({ name: "", email: "", password: "", nik: "", officeLocationId: "", baseSalary: "", allowance: "", bpjsPercent: "2", taxPercent: "5" });
      setKtpFile(null);
      setKtpPreview(null);
      setKtpDescriptor(null);
      setFaceStatus(null);
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setMsg("Terjadi kesalahan");
    }
    setLoading(false);
  }

  async function deleteEmployee(id) {
    if (!confirm("Hapus karyawan ini?")) return;
    await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    loadEmployees();
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      <AdminNavbar />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Registrasi Karyawan</h1>
              <p className="text-sm mt-0.5" style={{ color: "#5a7d96" }}>{employees.length} karyawan terdaftar</p>
            </div>
            <button
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{
                background: showForm ? "rgba(239,68,68,0.12)" : "linear-gradient(135deg, #0B89C4, #094D8C)",
                color: showForm ? "#ef4444" : "white",
                border: showForm ? "1px solid rgba(239,68,68,0.25)" : "none",
                boxShadow: showForm ? "none" : "0 4px 16px rgba(11,137,196,0.3)",
              }}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Tutup Form" : "+ Tambah Karyawan"}
            </button>
          </div>

          {msg && (
            <div className="admin-card py-3 text-sm" style={{ color: "#2a3f52" }}>
              {msg}
            </div>
          )}

          {locations.length === 0 && (
            <div className="admin-card py-3 text-sm" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              Belum ada lokasi kantor. Tambahkan lokasi dulu di halaman Dashboard.
            </div>
          )}

          {showForm && (
            <div className="admin-card">
              <h3 className="text-sm font-semibold mb-5" style={{ color: "#0873a8" }}>Data Karyawan Baru</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 320px" }}>
                  {/* Col 1: Identitas */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#5a7d96" }}>Identitas</p>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Nama Lengkap</label>
                      <input className="admin-input" placeholder="Budi Santoso" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Email</label>
                      <input className="admin-input" type="email" placeholder="budi@perusahaan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Password Awal</label>
                      <input className="admin-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>NIK</label>
                      <input className="admin-input mono" placeholder="3174052309870001" maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Lokasi Kantor</label>
                      <select className="admin-input" value={form.officeLocationId} onChange={(e) => setForm({ ...form, officeLocationId: e.target.value })} required>
                        <option value="">Pilih lokasi</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Col 2: Kompensasi */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#5a7d96" }}>Kompensasi</p>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Gaji Pokok (Rp)</label>
                      <input className="admin-input" type="number" placeholder="8500000" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>Tunjangan (Rp)</label>
                      <input className="admin-input" type="number" placeholder="1200000" value={form.allowance} onChange={(e) => setForm({ ...form, allowance: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>BPJS (%)</label>
                      <input className="admin-input" type="number" step="0.5" placeholder="2" value={form.bpjsPercent} onChange={(e) => setForm({ ...form, bpjsPercent: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "#6a8faa" }}>PPh 21 (%)</label>
                      <input className="admin-input" type="number" step="1" placeholder="5" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
                    </div>

                    {estimasi !== null && (
                      <div className="rounded-xl p-3 mt-1" style={{ background: "#f0f6fb", border: "1px solid #dde8f0" }}>
                        <p className="text-xs font-medium mb-2" style={{ color: "#5a7d96" }}>Estimasi Take-home</p>
                        <p className="text-base font-bold mono" style={{ color: "#0873a8" }}>{fmt(estimasi)}</p>
                      </div>
                    )}
                  </div>

                  {/* Col 3: Foto KTP */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#5a7d96" }}>Foto KTP</p>
                    <div
                      className="rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all"
                      style={{ background: "#f0f6fb", border: ktpPreview ? "2px solid rgba(11,137,196,0.4)" : "2px dashed #dde8f0", minHeight: 160 }}
                      onClick={() => fileRef.current?.click()}
                    >
                      {ktpPreview ? (
                        <img src={ktpPreview} alt="KTP preview" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-6">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(11,137,196,0.1)" }}>
                            <svg width="20" height="20" fill="none" stroke="#3BA7D9" strokeWidth="1.5" viewBox="0 0 24 24">
                              <rect x="3" y="5" width="18" height="14" rx="2" />
                              <circle cx="8" cy="11" r="2" />
                              <path d="M3 18l4-4 3 3 4-5 7 7" />
                            </svg>
                          </div>
                          <p className="text-xs text-center" style={{ color: "#5a7d96" }}>Klik untuk upload foto KTP</p>
                          <p className="text-[10px]" style={{ color: "#2a3f5a" }}>JPG, PNG — maks 5MB</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    {faceStatus && (
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: faceStatus === "found" ? "rgba(16,185,129,0.1)" : faceStatus === "notfound" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                          border: `1px solid ${faceStatus === "found" ? "rgba(16,185,129,0.25)" : faceStatus === "notfound" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
                        }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: faceStatus === "found" ? "#10b981" : faceStatus === "notfound" ? "#ef4444" : "#f59e0b" }}
                        >
                          {faceStatus === "detecting" && "Mendeteksi wajah..."}
                          {faceStatus === "found" && "Wajah terdeteksi ✓"}
                          {faceStatus === "notfound" && "Wajah tidak ditemukan"}
                        </span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="admin-btn-primary w-full text-sm py-2.5 mt-auto">
                      {loading ? "Menyimpan..." : "Daftarkan Karyawan"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="admin-card p-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #dde8f0" }}>
              <h2 className="text-[15px] font-semibold text-slate-800">Daftar Karyawan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>KTP</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>NIK</th>
                    <th>Lokasi</th>
                    <th>Gaji Pokok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6" style={{ color: "#9ab0c4" }}>
                        Belum ada karyawan terdaftar
                      </td>
                    </tr>
                  )}
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        {emp.ktpPhotoUrl ? (
                          <img src={emp.ktpPhotoUrl} alt="KTP" className="w-10 h-7 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-7 rounded-lg" style={{ background: "#f0f6fb" }} />
                        )}
                      </td>
                      <td className="font-medium text-slate-800">{emp.name}</td>
                      <td style={{ color: "#6a8faa", fontSize: 12 }}>{emp.email}</td>
                      <td className="mono" style={{ fontSize: 12, color: "#5a7d96" }}>{emp.nik}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(11,137,196,0.1)", color: "#0873a8" }}>
                          {emp.officeLocation?.name || "-"}
                        </span>
                      </td>
                      <td className="mono" style={{ color: "#2a3f52" }}>{fmt(emp.baseSalary)}</td>
                      <td>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}