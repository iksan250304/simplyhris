"use client";

import { useState, useEffect } from "react";
import EmployeeNavbar from "@/components/EmployeeNavbar";

function Spinner() {
  return <span className="spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />;
}

function BadgeStatus({ day }) {
  const map = {
    HADIR: ["b-green", "Hadir"],
    BELUM_CHECKOUT: ["b-blue", "Belum Check-Out"],
    TIDAK_HADIR: ["b-red", "Tidak Hadir"],
  };

  if (day.status === "HADIR" && day.isLate) return <span className="badge b-amber">Terlambat</span>;
  if (day.status === "TIDAK_HADIR" && day.dispensationStatus === "PENDING") return <span className="badge b-purple">Dispensasi · Pending</span>;
  if (day.status === "TIDAK_HADIR" && day.dispensationStatus === "APPROVED") return <span className="badge b-green">Dispensasi · Disetujui</span>;
  if (day.status === "TIDAK_HADIR" && day.dispensationStatus === "REJECTED") return <span className="badge b-red">Dispensasi · Ditolak</span>;

  const [cls, lbl] = map[day.status] || ["b-gray", day.status];
  return <span className={`badge ${cls}`}>{lbl}</span>;
}

export default function HistoryPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState([]);
  const [reminders, setReminders] = useState({});

  const [openRow, setOpenRow] = useState(null);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const monthOptions = [
    { v: 1, l: "Januari" }, { v: 2, l: "Februari" }, { v: 3, l: "Maret" }, { v: 4, l: "April" },
    { v: 5, l: "Mei" }, { v: 6, l: "Juni" }, { v: 7, l: "Juli" }, { v: 8, l: "Agustus" },
    { v: 9, l: "September" }, { v: 10, l: "Oktober" }, { v: 11, l: "November" }, { v: 12, l: "Desember" },
  ];

  useEffect(() => {
    loadData();
  }, [month, year]);

  async function loadData() {
    const res = await fetch(`/api/attendance/history?month=${month}&year=${year}`);
    const d = await res.json();
    setDays(d.days || []);
    setReminders(d.reminders || {});
  }

  function canRequestDisp(day) {
    return day.status === "TIDAK_HADIR" && day.dispensationStatus === "NONE";
  }

  async function submitRequest(date) {
    if (!reason) return;
    setSubmitting(true);

    let proofBase64 = null;
    if (file) {
      proofBase64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
      });
    }

    await fetch("/api/attendance/request-dispensation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason, proofBase64 }),
    });

    setSubmitting(false);
    setOpenRow(null);
    setReason("");
    setFile(null);
    loadData();
  }

  const alerts = [
    reminders.belumCheckIn && { msg: "Belum Check-In hari ini", bg: "rgba(255,251,235,0.8)", border: "rgba(245,158,11,0.28)" },
    reminders.belumCheckOut && { msg: "Belum Check-Out hari ini", bg: "rgba(239,246,255,0.8)", border: "rgba(147,197,253,0.4)" },
    reminders.telatHariIni && { msg: "Anda tercatat terlambat hari ini", bg: "rgba(254,242,242,0.8)", border: "rgba(252,165,165,0.4)" },
  ].filter(Boolean);

  return (
    <div className="grad-bg min-h-screen">
      <EmployeeNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight mb-0.5">Riwayat Kehadiran</h1>
        <p className="text-slate-500 text-[13px] mb-5">Rekap presensi bulanan Anda</p>

        {alerts.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-5">
            {alerts.map((a) => (
              <div
                key={a.msg}
                className="glass rounded-xl px-4 py-2.5 fade-up text-[13px] font-medium"
                style={{ background: a.bg, border: `1px solid ${a.border}`, color: "#1E293B" }}
              >
                {a.msg}
              </div>
            ))}
          </div>
        )}

        <div className="glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/60">
            <p className="text-[13px] font-semibold text-slate-700">Data Kehadiran</p>
            <div className="flex gap-2">
              <select className="field text-[13px] py-2 px-3 w-auto" style={{ minWidth: 110 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {monthOptions.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.l}
                  </option>
                ))}
              </select>
              <select className="field text-[13px] py-2 px-3 w-auto" style={{ minWidth: 90 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[year - 1, year, year + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr className="border-b border-slate-100/80">
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Masuk</th>
                  <th className="px-4 py-3 text-left">Pulang</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {days.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      Belum ada data presensi
                    </td>
                  </tr>
                )}
                {days.map((day) => (
                  <>
                    <tr key={day.date} className="border-b border-slate-100/60 hover:bg-white/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                        {day.checkInTime ? new Date(day.checkInTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                        {day.checkOutTime ? new Date(day.checkOutTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <BadgeStatus day={day} />
                      </td>
                      <td className="px-4 py-3.5">
                        {canRequestDisp(day) && (
                          <button
                            onClick={() => setOpenRow(openRow === day.date ? null : day.date)}
                            className="text-[12px] font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap"
                          >
                            {openRow === day.date ? "Tutup" : "Dispensasi"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {openRow === day.date && (
                      <tr key={`${day.date}-form`}>
                        <td colSpan={5} className="px-5 py-4" style={{ background: "rgba(248,250,252,0.7)" }}>
                          <div className="fade-up">
                            <p className="text-[12px] font-semibold text-slate-600 mb-2.5 uppercase tracking-wider">
                              Formulir Dispensasi ·{" "}
                              {new Date(day.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <textarea
                                className="field resize-none text-[13px] flex-1"
                                rows={2}
                                placeholder="Alasan ketidakhadiran / keterlambatan..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                              <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
                                <label
                                  className="flex-1 sm:flex-none text-[12px] text-slate-500 border border-dashed border-slate-300 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors truncate text-center"
                                  style={{ background: "rgba(255,255,255,0.6)" }}
                                >
                                  {file?.name ?? "Unggah bukti"}
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                                </label>
                                <button onClick={() => submitRequest(day.date)} disabled={submitting} className="btn btn-blue py-2 text-[13px]">
                                  {submitting ? <Spinner /> : "Kirim"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}