"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";

const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function fmt(n) {
  return "Rp " + Math.round(Number(n || 0)).toLocaleString("id-ID");
}

export default function AdminPayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [overtimeInputs, setOvertimeInputs] = useState({});
  const [generatingId, setGeneratingId] = useState(null);
  const [msg, setMsg] = useState("");

  const [fineRate, setFineRate] = useState("");
  const [savedRate, setSavedRate] = useState(false);
  const [savingRate, setSavingRate] = useState(false);

  useEffect(() => {
    loadSetting();
  }, []);

  useEffect(() => {
    loadData();
  }, [month, year]);

  async function loadSetting() {
    const res = await fetch("/api/admin/settings");
    const d = await res.json();
    if (d.setting) setFineRate(d.setting.lateFinePerMinute);
  }

  async function saveFineRate() {
    setSavingRate(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lateFinePerMinute: fineRate }),
    });
    const d = await res.json();
    setSavingRate(false);
    if (res.ok) {
      setSavedRate(true);
      setTimeout(() => setSavedRate(false), 2500);
      loadData();
    } else {
      setMsg(d.error);
    }
  }

  async function loadData() {
    const res = await fetch(`/api/admin/payroll?month=${month}&year=${year}`);
    const data = await res.json();
    setRows(data.rows || []);
  }

  async function generatePayroll(userId) {
    setGeneratingId(userId);
    const res = await fetch("/api/admin/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, userId, overtimePay: overtimeInputs[userId] || 0 }),
    });
    const data = await res.json();
    setMsg(res.ok ? "" : data.error);
    setGeneratingId(null);
    loadData();
  }

  const totalGenerated = rows.filter((r) => r.generated).length;
  const totalPayroll = rows.reduce((s, r) => s + (r.generated ? Number(r.generated.netSalary) : 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      <AdminNavbar />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Manajemen Payroll</h1>
              <p className="text-sm mt-0.5" style={{ color: "#5a7d96" }}>{months[month - 1]} {year}</p>
            </div>
            <div className="flex gap-3">
              {[
                { label: "Total Karyawan", val: rows.length },
                { label: "Sudah Diproses", val: `${totalGenerated}/${rows.length}`, accent: true },
                { label: "Total Payroll", val: fmt(totalPayroll), blue: true },
              ].map((s) => (
                <div key={s.label} className="px-4 py-2.5 rounded-xl text-right" style={{ background: "#ffffff", border: "1px solid #dde8f0" }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#5a7d96" }}>{s.label}</p>
                  <p className="text-sm font-bold mono" style={{ color: s.blue ? "#3BA7D9" : s.accent ? "#10b981" : "#2a3f52" }}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>

          {msg && (
            <div className="admin-card py-3 text-sm" style={{ color: "#ef4444" }}>
              {msg}
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="admin-card flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-800">Denda Keterlambatan</p>
                <p className="text-xs mt-0.5" style={{ color: "#5a7d96" }}>Tarif per menit keterlambatan</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "#5a7d96" }}>Rp</span>
                  <input className="admin-input text-right mono" type="number" value={fineRate} onChange={(e) => setFineRate(e.target.value)} style={{ width: 120, paddingLeft: 32 }} />
                </div>
                <span className="text-xs" style={{ color: "#5a7d96" }}>/menit</span>
                <button onClick={saveFineRate} disabled={savingRate} className="admin-btn-primary text-sm px-4 py-2 whitespace-nowrap">
                  {savedRate ? "Tersimpan" : savingRate ? "..." : "Simpan"}
                </button>
              </div>
            </div>

            <div className="admin-card flex items-center gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-800">Periode Penggajian</p>
                <p className="text-xs mt-0.5" style={{ color: "#5a7d96" }}>Pilih bulan dan tahun</p>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <select className="admin-input" value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 140 }}>
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <input className="admin-input mono" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 90 }} />
              </div>
            </div>
          </div>

          <div className="admin-card p-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #dde8f0" }}>
              <h2 className="text-[15px] font-semibold text-slate-800">Slip Gaji Karyawan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Gaji Pokok</th>
                    <th>Tunjangan</th>
                    <th>Denda Telat</th>
                    <th>Upah Lembur</th>
                    <th>Net Salary</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6" style={{ color: "#9ab0c4" }}>
                        Belum ada karyawan
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => {
                    const initials = r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={r.userId}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #0B89C4, #094D8C)", color: "white" }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{r.name}</p>
                              {r.generated && (
                                <p className="text-[10px]" style={{ color: "#10b981" }}>Slip digenerate</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="mono" style={{ color: "#2a3f52" }}>{fmt(r.baseSalary)}</td>
                        <td className="mono" style={{ color: "#2a3f52" }}>{fmt(r.allowance)}</td>
                        <td>
                          <span className="mono" style={{ color: "#ef4444" }}>-{fmt(r.lateDeduction)}</span>
                        </td>
                        <td>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#5a7d96" }}>Rp</span>
                            <input
                              className="admin-input text-right mono"
                              type="number"
                              placeholder="0"
                              value={overtimeInputs[r.userId] ?? (r.generated ? r.generated.overtimePay : "")}
                              onChange={(e) => setOvertimeInputs({ ...overtimeInputs, [r.userId]: Number(e.target.value) })}
                              style={{ width: 130, paddingLeft: 32, fontSize: 12 }}
                            />
                          </div>
                        </td>
                        <td>
                          <span className="font-bold text-sm mono" style={{ color: "#0873a8" }}>
                            {r.generated ? fmt(r.generated.netSalary) : "-"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => generatePayroll(r.userId)}
                            disabled={generatingId === r.userId}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: r.generated ? "rgba(16,185,129,0.12)" : "rgba(11,137,196,0.12)",
                              color: r.generated ? "#10b981" : "#3BA7D9",
                              border: `1px solid ${r.generated ? "rgba(16,185,129,0.25)" : "rgba(11,137,196,0.25)"}`,
                              opacity: generatingId === r.userId ? 0.7 : 1,
                              minWidth: 80,
                            }}
                          >
                            {generatingId === r.userId ? "..." : r.generated ? "Update" : "Generate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #dde8f0", background: "#f0f6fb" }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5a7d96" }}>Total Payroll Bulan Ini</span>
              <span className="text-base font-bold mono" style={{ color: "#0873a8" }}>{fmt(totalPayroll)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}