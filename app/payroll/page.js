"use client";

import { useState, useRef } from "react";
import EmployeeNavbar from "@/components/EmployeeNavbar";

function Spinner() {
  return <span className="spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />;
}

const idr = (n) => "Rp " + Number(n).toLocaleString("id-ID");

function monthName(m) {
  const names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return names[m - 1];
}

function SlipDoc({ p }) {
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "40px 48px",
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        minHeight: "700px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <svg viewBox="0 0 175.25 98.58" style={{ width: "110px", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#0C0C0C"
            d="M57.77,44.1c2.58-2.4,5.45-2.91,8.56-2.5c2.09,0.27,3.89,1.17,5.25,2.78c0.65,0.77,0.98,0.83,1.77,0.08
            c4.45-4.23,11.12-4.02,14.65,0.39c1.42,1.78,2.02,3.87,2.04,6.1c0.05,4.68-0.01,9.35,0.04,14.03c0.01,0.99-0.32,1.25-1.25,1.21
            c-1.71-0.06-3.43-0.06-5.14,0c-0.98,0.04-1.35-0.21-1.33-1.3c0.07-3.95,0.04-7.9,0.03-11.85c-0.01-2.73-1.35-4.43-3.62-4.61
            c-2.4-0.19-4.36,1.37-4.71,4c-0.4,2.99-0.06,6.02-0.18,9.03c-0.06,1.53,0.69,3.51-0.35,4.46c-0.95,0.87-2.88,0.22-4.38,0.23
            c-3.02,0.03-3.02,0.01-3.02-2.98c0-3.43,0.01-6.86,0-10.29c-0.01-2.54-1.29-4.18-3.44-4.44c-2.27-0.28-3.97,0.98-4.71,3.4
            c-0.36,1.18-0.28,2.37-0.28,3.56c-0.01,3.12-0.04,6.24,0.02,9.35c0.02,1.03-0.18,1.5-1.34,1.44c-1.71-0.1-3.43-0.06-5.14-0.01
            c-0.89,0.03-1.29-0.17-1.28-1.2c0.04-7.22,0.04-14.45,0.01-21.67c0-0.9,0.27-1.18,1.15-1.15c1.66,0.06,3.32,0.01,4.99,0.02
            C57.62,42.18,57.62,42.18,57.77,44.1z"
          />
          <path
            fill="#0A0A0A"
            d="M101.55,43.72c6.11-4.04,12.82-2.14,16.02,1.88c3.95,4.96,3.83,12.66-0.26,17.45
            c-3.51,4.1-10.34,5.29-15.57,1.64c-0.52,0.24-0.29,0.72-0.3,1.09c-0.02,2.91-0.04,5.82,0.01,8.73c0.02,0.98-0.25,1.4-1.32,1.35
            c-1.71-0.08-3.43-0.07-5.14,0c-0.92,0.03-1.3-0.22-1.29-1.21c0.02-10.49,0.02-20.98,0-31.48c0-0.74,0.22-1.01,0.98-0.99
            c1.92,0.04,3.85,0.09,5.76-0.02C101.65,42.08,101.35,42.96,101.55,43.72z M112.92,54.19c0.01-3.55-2.33-6.14-5.6-6.19
            c-3.26-0.05-5.87,2.67-5.9,6.14c-0.03,3.48,2.54,6.19,5.84,6.18C110.55,60.31,112.9,57.76,112.92,54.19z"
          />
          <path
            fill="#0C0C0C"
            d="M149.57,55.61c1.82-4.2,3.63-8.28,5.35-12.39c0.36-0.87,0.81-1.18,1.73-1.15c1.97,0.06,3.95,0.05,5.92,0.01
            c0.89-0.02,1.09,0.16,0.7,1.06c-4.55,10.48-9.06,20.97-13.56,31.47c-0.38,0.88-0.83,1.29-1.85,1.24c-1.87-0.09-3.74-0.05-5.61-0.01
            c-1.08,0.02-1.26-0.32-0.83-1.29c1.17-2.6,2.23-5.26,3.43-7.85c0.46-0.99,0.43-1.81,0.01-2.79c-2.93-6.77-5.78-13.56-8.73-20.32
            c-0.55-1.26-0.39-1.6,1-1.52c1.81,0.1,3.64,0.09,5.45,0c0.95-0.04,1.36,0.31,1.69,1.16c1.41,3.63,2.89,7.23,4.37,10.84
            C148.86,54.57,148.91,55.19,149.57,55.61z"
          />
          <path
            fill="#0C0C0C"
            d="M23.6,66.86c-2.2-0.04-4.76-0.35-7.09-1.67c-1.7-0.96-2.87-2.34-3.51-4.2c-0.28-0.83-0.15-1.23,0.77-1.39
            c1.89-0.33,3.78-0.72,5.64-1.16c0.63-0.15,0.77,0.12,1.03,0.58c1.06,1.85,3.72,2.67,5.71,1.79c0.69-0.3,1.31-0.74,1.28-1.6
            c-0.03-0.87-0.71-1.28-1.43-1.45c-1.97-0.45-3.97-0.78-5.95-1.22c-2.72-0.6-5.2-1.62-6.3-4.48c-1.4-3.66,0.3-7.78,4.15-9.42
            c4.33-1.85,8.71-1.71,12.89,0.63c1.59,0.89,2.67,2.26,3.35,3.97c0.32,0.8,0.32,1.21-0.69,1.36c-1.64,0.25-3.27,0.61-4.88,0.99
            c-0.73,0.17-1.07,0.01-1.45-0.68c-0.9-1.65-3.09-2.38-4.87-1.77c-0.79,0.27-1.38,0.77-1.38,1.68c0,0.89,0.63,1.3,1.37,1.47
            c2.03,0.45,4.07,0.81,6.1,1.27c4.72,1.07,7,4.08,6.43,8.41c-0.4,3.08-2.7,5.41-6.28,6.35C27.03,66.71,25.54,66.86,23.6,66.86z"
          />
          <path
            fill="#0C0C0C"
            d="M124.17,51.16c0-2.65,0.03-5.29-0.02-7.94c-0.02-0.89,0.27-1.18,1.15-1.15c1.76,0.05,3.53,0.08,5.29,0
            c1.07-0.05,1.29,0.35,1.28,1.34c-0.05,4.51-0.02,9.03-0.02,13.54c0,2.69,1.03,3.58,3.57,2.78c1.28-0.4,1.64-0.02,1.8,1.12
            c0.13,0.92,0.22,1.88,0.53,2.74c0.53,1.48-0.02,2.1-1.4,2.61c-4.82,1.75-9.65,0.15-11.46-3.93c-0.6-1.35-0.75-2.79-0.73-4.26
            C124.19,55.73,124.17,53.45,124.17,51.16z"
          />
          <path
            fill="#0A0A0A"
            d="M46.27,54.28c0,3.48-0.04,6.97,0.02,10.45c0.02,1.04-0.2,1.51-1.35,1.46c-1.71-0.09-3.43-0.06-5.14-0.01
            c-0.91,0.03-1.27-0.2-1.27-1.21c0.04-7.17,0.05-14.35,0-21.52c-0.01-1.07,0.35-1.33,1.34-1.28c1.66,0.07,3.33,0.1,4.99-0.01
            c1.23-0.08,1.46,0.4,1.44,1.52C46.23,47.21,46.27,50.74,46.27,54.28z"
          />
          <g>
            <rect x="116.56" y="23.53" fill="#0B89C4" width="15.18" height="7.75" />
            <polygon fill="#094D8C" points="131.74,23.53 123.99,31.38 123.99,39.3 131.74,39.3" />
          </g>
        </svg>
        <div style={{ color: "#DC2626", fontWeight: 700, fontSize: "13px", letterSpacing: "0.5px" }}>
          *CONFIDENTIAL DOCUMENT
        </div>
      </div>

      <div style={{ borderBottom: "2px solid #1a1a1a", marginTop: "16px", marginBottom: "28px" }} />

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>Slip Gaji</h1>
        <p style={{ fontSize: "13px", color: "#444", marginTop: "4px" }}>
          Slip Gaji Periode {monthName(p.period.month)} {p.period.year}*
        </p>
      </div>

      {/* Employee info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 24px",
          fontSize: "13px",
          marginBottom: "28px",
          padding: "16px 20px",
          backgroundColor: "#F8FAFC",
          borderRadius: "8px",
        }}
      >
        <div><strong>Nama</strong><br />{p.user.name}</div>
        <div><strong>NIK</strong><br />{p.user.nik || "-"}</div>
        <div><strong>Email</strong><br />{p.user.email}</div>
        <div><strong>Periode</strong><br />{monthName(p.period.month)} {p.period.year}</div>
      </div>

      {/* Salary breakdown */}
      <div style={{ fontSize: "13px" }}>
        {[
          { label: "Gaji Pokok", value: p.baseSalary, negative: false },
          { label: "Tunjangan", value: p.allowance, negative: false },
          { label: "Upah Lembur", value: p.overtimePay, negative: false },
          { label: "Potongan PPh 21", value: p.taxDeduction, negative: true },
          { label: "Potongan BPJS", value: p.bpjsDeduction, negative: true },
          { label: "Denda Terlambat/Alpa", value: p.lateDeduction, negative: true },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 4px",
              borderBottom: "1px solid #E5E7EB",
              color: item.negative ? "#DC2626" : "#1a1a1a",
            }}
          >
            <span>{item.label}</span>
            <span>
              {item.negative ? "- " : ""}
              {idr(item.value)}
            </span>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "18px",
            marginTop: "8px",
            borderTop: "2px solid #1a1a1a",
            fontWeight: 800,
            fontSize: "15px",
          }}
        >
          <span>Gaji Bersih (Take Home Pay)</span>
          <span>{idr(p.netSalary)}</span>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flexGrow: 1 }} />

      {/* Footer */}
      <div>
        <div style={{ borderTop: "1px solid #1a1a1a", marginBottom: "12px" }} />
        <p style={{ fontSize: "10px", color: "#6B7280", textAlign: "center", lineHeight: "1.5", margin: 0 }}>
          Dokumen ini bersifat rahasia dan hanya diperuntukkan bagi karyawan yang bersangkutan. Dilarang
          membagikan atau menyebarluaskan tanpa izin HRD/Manajemen. Pelanggaran akan dikenakan sanksi
          sesuai ketentuan yang berlaku.
        </p>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [payrolls, setPayrolls] = useState([]);
  const [period, setPeriod] = useState("all");
  const [open, setOpen] = useState(null);
  const slipRefs = useRef({});

  async function auth(e) {
    e.preventDefault();
    setPwErr("");
    if (!pw) {
      setPwErr("Password wajib diisi.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();

    if (!res.ok) {
      setPwErr(data.error || "Verifikasi gagal");
      setLoading(false);
      return;
    }

    const listRes = await fetch("/api/payroll");
    const listData = await listRes.json();
    setPayrolls(listData.payrolls || []);
    setAuthed(true);
    setLoading(false);
  }

  async function exportPdf(payrollId) {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = slipRefs.current[payrollId];
    html2pdf()
      .set({
        margin: 0,
        filename: `slip-gaji-${payrollId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  }

  const periodOptions = Array.from(
    new Map(payrolls.map((p) => [`${p.period.year}-${p.period.month}`, { month: p.period.month, year: p.period.year }])).values()
  ).sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));

  const list = period === "all" ? payrolls : payrolls.filter((p) => `${p.period.year}-${p.period.month}` === period);

  if (!authed) {
    return (
      <div className="grad-bg min-h-screen">
        <EmployeeNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex justify-center">
          <div className="w-full max-w-[360px] fade-up">
            <div className="glass rounded-[22px] p-7">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="grad-primary w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ boxShadow: "0 4px 14px rgba(9,77,140,0.28)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="7" width="12" height="9" rx="2" stroke="white" strokeWidth="1.5" />
                    <path d="M6 7V5a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-bold text-slate-800 text-[16px]">Verifikasi Identitas</p>
                <p className="text-slate-500 text-[13px] mt-0.5">Slip gaji bersifat rahasia</p>
              </div>
              <form onSubmit={auth} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Konfirmasi Password</label>
                  <input type="password" className="field" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
                  {pwErr && <p className="text-red-500 text-[12px]">{pwErr}</p>}
                </div>
                <button type="submit" className="btn btn-blue w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner /> Memverifikasi...
                    </>
                  ) : (
                    "Verifikasi & Lihat Slip Gaji"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grad-bg min-h-screen">
      <EmployeeNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="flex items-center justify-between mb-0.5">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Slip Gaji</h1>
          <button onClick={() => setAuthed(false)} className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1.5" y="5" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Kunci
          </button>
        </div>
        <p className="text-slate-500 text-[13px] mb-5">Dokumen rahasia · Jangan bagikan kepada pihak lain</p>

        {payrolls.length > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <select className="field text-[13px] py-2.5 px-3 w-auto" style={{ minWidth: 175 }} value={period} onChange={(e) => { setPeriod(e.target.value); setOpen(null); }}>
              <option value="all">Semua Periode</option>
              {periodOptions.map((opt) => (
                <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                  {monthName(opt.month)} {opt.year}
                </option>
              ))}
            </select>
          </div>
        )}

        {payrolls.length === 0 && (
          <div className="glass rounded-[20px] p-8 text-center text-slate-500 text-[13px]">Belum ada slip gaji yang tersedia</div>
        )}

        <div className="flex flex-col gap-3">
          {list.map((p) => (
            <div key={p.id} className="glass rounded-[20px] overflow-hidden fade-up">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">
                    {monthName(p.period.month)} {p.period.year}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Gaji Bersih <span className="font-semibold text-slate-700">{idr(p.netSalary)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportPdf(p.id)} className="btn btn-ghost py-2 px-3 text-[12px]">
                    Export PDF
                  </button>
                  <button onClick={() => setOpen(open === p.id ? null : p.id)} className="btn btn-blue py-2 px-4 text-[12px]">
                    {open === p.id ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </div>

              <div ref={(el) => (slipRefs.current[p.id] = el)} className={open === p.id ? "border-t border-white/50 fade-up" : "hidden"}>
                <SlipDoc p={p} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}