"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import EmployeeNavbar from "@/components/EmployeeNavbar";
import { loadFaceModels, getFaceDescriptorFromImage } from "@/lib/faceapi";

function Spinner() {
  return <span className="spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />;
}

export default function DashboardPage() {
  const [attendance, setAttendance] = useState(null);
  const [mode, setMode] = useState("idle"); // idle | checkin | checkout
  const [faceState, setFaceState] = useState("idle"); // idle | verifying | verified | error
  const [faceMsg, setFaceMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selfie, setSelfie] = useState(null);

  const [needDispensation, setNeedDispensation] = useState(false);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [showDisp, setShowDisp] = useState(false);
  const [dispReason, setDispReason] = useState("");
  const [dispFile, setDispFile] = useState(null);
  const [dispSent, setDispSent] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const now = new Date();
  const timeNow = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    fetch("/api/attendance/check-in")
      .then((r) => r.json())
      .then((d) => setAttendance(d.attendance));
    loadFaceModels();
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("idle");
    setFaceState("idle");
    setFaceMsg("");
    setSelfie(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function openCamera(m) {
    setMode(m);
    setFaceState("idle");
    setFaceMsg("");
    setSelfie(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      await loadFaceModels();
    } catch (err) {
      setFaceState("error");
      setFaceMsg("Kamera tidak dapat diakses");
    }
  }

  function getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });
  }

  async function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

    // Langsung tampilkan foto & matikan stream kamera, tanpa menunggu verifikasi
    setSelfie(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setFaceState("verifying");
    setFaceMsg("Memverifikasi wajah...");

    try {
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));

      const descriptor = await getFaceDescriptorFromImage(img);
      if (!descriptor) {
        setFaceState("error");
        setFaceMsg("Wajah tidak terdeteksi, coba lagi");
        return;
      }

      const res = await fetch("/api/attendance/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieDescriptor: descriptor }),
      });
      const data = await res.json();

      if (!res.ok || data.similarity < 50) {
        setFaceState("error");
        setFaceMsg(`Wajah tidak cocok (${data.similarity?.toFixed(1) || 0}%)`);
        return;
      }

      setFaceState("verified");
      setFaceMsg(`Wajah terverifikasi (${data.similarity.toFixed(1)}%)`);

      setTimeout(() => {
        const currentMode = mode;
        setMode("idle");
        setFaceState("idle");
        submitAttendance(dataUrl, currentMode);
      }, 500);
    } catch (err) {
      setFaceState("error");
      setFaceMsg("Gagal memverifikasi wajah");
    }
  }

  async function submitAttendance(selfieBase64, type, extra = {}) {
    setSubmitting(true);
    try {
      const loc = await getLocation();
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, latitude: loc.latitude, longitude: loc.longitude, selfieBase64, ...extra }),
      });
      const data = await res.json();

      if (res.status === 202 && data.needDispensation) {
        setNeedDispensation(true);
        setLateMinutes(data.lateMinutes);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Gagal presensi");
        setSubmitting(false);
        return;
      }

      setAttendance(data.attendance);
      setNeedDispensation(false);
    } catch (err) {
      alert("Gagal mengambil lokasi GPS. Aktifkan izin lokasi.");
    }
    setSubmitting(false);
  }

  async function sendDispensation() {
    if (!dispReason) return;
    let proofBase64 = null;
    if (dispFile) {
      proofBase64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(dispFile);
      });
    }
    await submitAttendance(selfie, "checkin", { lateReason: dispReason, lateProofBase64: proofBase64 });
    setDispSent(true);
    setShowDisp(false);
  }

  const alreadyCheckedIn = !!attendance?.checkInTime;
  const alreadyCheckedOut = !!attendance?.checkOutTime;
  const checkInLabel = attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : null;
  const checkOutLabel = attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className="grad-bg min-h-screen">
      <EmployeeNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Presensi Hari Ini</h1>
          <p className="text-slate-500 text-[13px] mt-0.5 capitalize">{dateLabel}</p>
        </div>

        {needDispensation && !dispSent && (
          <div
            className="glass rounded-2xl px-4 py-3.5 mb-4 fade-up"
            style={{ border: "1px solid rgba(245,158,11,0.3)", background: "rgba(255,251,235,0.75)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-amber-800">Anda terlambat {lateMinutes} menit</p>
                <p className="text-[12px] text-amber-700 mt-0.5">Belum mengajukan dispensasi keterlambatan</p>
              </div>
              <button
                onClick={() => setShowDisp((v) => !v)}
                className="text-[12px] font-semibold text-amber-700 whitespace-nowrap underline underline-offset-2 flex-shrink-0"
              >
                {showDisp ? "Tutup" : "Ajukan"}
              </button>
            </div>

            {showDisp && (
              <div className="mt-3 pt-3 border-t border-amber-200 flex flex-col gap-2.5 fade-up">
                <textarea
                  className="field resize-none text-[13px]"
                  rows={2}
                  placeholder="Jelaskan alasan keterlambatan Anda..."
                  value={dispReason}
                  onChange={(e) => setDispReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <label
                    className="flex-1 text-[12px] text-slate-500 border border-dashed border-slate-300 rounded-xl px-3 py-2 cursor-pointer hover:border-amber-400 hover:text-amber-600 transition-colors truncate"
                    style={{ background: "rgba(255,255,255,0.5)" }}
                  >
                    {dispFile?.name ?? "Unggah foto bukti (opsional)"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setDispFile(e.target.files[0])} />
                  </label>
                  <button onClick={sendDispensation} disabled={submitting} className="btn btn-amber flex-shrink-0 px-4 py-2 text-[13px]">
                    {submitting ? <Spinner /> : "Kirim"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode !== "idle" && (
          <div className="glass-dark rounded-[22px] overflow-hidden mb-5 fade-up">
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-white text-[13px] font-semibold">{mode === "checkin" ? "Verifikasi Check-In" : "Verifikasi Check-Out"}</p>
              <span
                className="badge"
                style={{
                  background: faceState === "verified" ? "rgba(34,197,94,0.2)" : faceState === "error" ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)",
                  color: faceState === "verified" ? "#4ADE80" : faceState === "error" ? "#F87171" : "#93C5FD",
                }}
              >
                {faceState === "idle" && "Siap memindai"}
                {faceState === "verifying" && "Memverifikasi wajah"}
                {faceState === "verified" && "Wajah terverifikasi"}
                {faceState === "error" && (faceMsg || "Gagal mendeteksi")}
              </span>
            </div>

            <div className="relative w-full bg-slate-950" style={{ aspectRatio: "16/9", maxHeight: "56vw" }}>
              {selfie ? (
                <img src={selfie} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-full border border-white/30" style={{ width: "min(45%, 160px)", aspectRatio: "3/4" }} />
              </div>
              {faceState === "verified" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="rounded-full border-2 border-green-400/60 flex items-center justify-center"
                    style={{ width: "min(45%, 160px)", aspectRatio: "3/4", background: "rgba(74,222,128,0.08)" }}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-400/20 border border-green-400/50 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3.5 9.5L7.5 13.5L14.5 5.5" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4">
              <button onClick={capture} disabled={faceState === "verifying" || !!selfie} className="btn btn-green-solid flex-1 py-3 text-[14px]">
                {faceState === "verifying" ? <Spinner /> : "Ambil Foto & Kirim"}
              </button>
              <button onClick={stopCamera} className="btn btn-ghost px-5 py-3 text-[14px]">
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
          {[
            { label: "Check-In", time: checkInLabel, badge: checkInLabel ? ["b-green", "Tercatat"] : ["b-gray", "Belum"] },
            { label: "Check-Out", time: checkOutLabel, badge: checkOutLabel ? ["b-green", "Tercatat"] : ["b-gray", "Belum"] },
          ].map(({ label, time, badge }) => (
            <div key={label} className="glass rounded-[20px] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
              <p className={`text-[28px] sm:text-[32px] font-bold tabular-nums leading-none ${time ? "text-slate-900" : "text-slate-200"}`}>
                {time ?? "--:--"}
              </p>
              <span className={`badge ${badge[0]} mt-2.5`}>{badge[1]}</span>
            </div>
          ))}
        </div>

        {mode === "idle" && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => openCamera("checkin")}
              disabled={alreadyCheckedIn}
              className="btn btn-blue py-5 text-[15px] flex-col gap-1 rounded-[18px]"
              style={{ height: 88 }}
            >
              <span className="text-[11px] font-medium opacity-70 uppercase tracking-widest">Rekam</span>
              <span>Check-In</span>
              {checkInLabel && <span className="text-[11px] opacity-60 font-mono">{checkInLabel}</span>}
            </button>
            <button
              onClick={() => openCamera("checkout")}
              disabled={alreadyCheckedOut || !alreadyCheckedIn}
              className="btn btn-slate py-5 text-[15px] flex-col gap-1 rounded-[18px]"
              style={{ height: 88 }}
            >
              <span className="text-[11px] font-medium opacity-70 uppercase tracking-widest">Rekam</span>
              <span>Check-Out</span>
              {checkOutLabel && <span className="text-[11px] opacity-60 font-mono">{checkOutLabel}</span>}
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-400 mt-5 tabular-nums">Waktu sekarang · {timeNow}</p>
      </div>
    </div>
  );
}