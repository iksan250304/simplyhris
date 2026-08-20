"use client";

import { useState, useEffect } from "react";

export default function AdminPayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [overtimeInputs, setOvertimeInputs] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fineRate, setFineRate] = useState("");
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

  async function saveFineRate(e) {
    e.preventDefault();
    setSavingRate(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lateFinePerMinute: fineRate }),
    });
    const d = await res.json();
    setMsg(res.ok ? "Nominal denda disimpan" : d.error);
    setSavingRate(false);
    loadData();
  }

  async function loadData() {
    const res = await fetch(`/api/admin/payroll?month=${month}&year=${year}`);
    const data = await res.json();
    setRows(data.rows || []);
  }

  async function handleGenerate(userId) {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        userId,
        overtimePay: overtimeInputs[userId] || 0,
      }),
    });
    const data = await res.json();
    setMsg(res.ok ? data.message : data.error);
    setLoading(false);
    loadData();
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-white">
          Simply HRIS <span className="text-red-500">Payroll</span>
        </h1>
        <a href="/admin/dashboard" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </a>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <form onSubmit={saveFineRate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-end gap-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Denda Keterlambatan (Rp / menit)</label>
            <input
              type="number"
              value={fineRate}
              onChange={(e) => setFineRate(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-48"
            />
          </div>
          <button
            disabled={savingRate}
            className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 disabled:opacity-60"
          >
            {savingRate ? "Menyimpan..." : "Simpan"}
          </button>
        </form>

        <div className="flex gap-3 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-28"
          />
        </div>

        {msg && <div className="p-3 rounded-lg bg-slate-800 text-slate-200 text-sm">{msg}</div>}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-500">
                <th className="py-2">Nama</th>
                <th className="py-2">Gaji Pokok</th>
                <th className="py-2">Tunjangan</th>
                <th className="py-2">Denda Telat</th>
                <th className="py-2">Upah Lembur</th>
                <th className="py-2">Net Salary</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId} className="border-b border-slate-800">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2">Rp {Number(r.baseSalary || 0).toLocaleString("id-ID")}</td>
                  <td className="py-2">Rp {Number(r.allowance || 0).toLocaleString("id-ID")}</td>
                  <td className="py-2 text-red-400">Rp {Number(r.lateDeduction).toLocaleString("id-ID")}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={overtimeInputs[r.userId] ?? (r.generated ? r.generated.overtimePay : "")}
                      onChange={(e) =>
                        setOvertimeInputs({ ...overtimeInputs, [r.userId]: Number(e.target.value) })
                      }
                      className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                    />
                  </td>
                  <td className="py-2 font-medium text-white">
                    {r.generated ? `Rp ${Number(r.generated.netSalary).toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleGenerate(r.userId)}
                      disabled={loading}
                      className="px-3 py-1 rounded bg-red-700 text-white text-xs hover:bg-red-800 disabled:opacity-60"
                    >
                      {r.generated ? "Update" : "Generate"}
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