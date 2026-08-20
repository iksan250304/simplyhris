"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function AdminLogo({ size = 32 }) {
  const width = size * 1.8;
  return (
    <div className="flex-shrink-0 flex items-center justify-center" style={{ width, height: size }}>
      <svg viewBox="0 0 175.25 98.58" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
        <path fill="#0C0C0C" d="M57.77,44.1c2.58-2.4,5.45-2.91,8.56-2.5c2.09,0.27,3.89,1.17,5.25,2.78c0.65,0.77,0.98,0.83,1.77,0.08c4.45-4.23,11.12-4.02,14.65,0.39c1.42,1.78,2.02,3.87,2.04,6.1c0.05,4.68-0.01,9.35,0.04,14.03c0.01,0.99-0.32,1.25-1.25,1.21c-1.71-0.06-3.43-0.06-5.14,0c-0.98,0.04-1.35-0.21-1.33-1.3c0.07-3.95,0.04-7.9,0.03-11.85c-0.01-2.73-1.35-4.43-3.62-4.61c-2.4-0.19-4.36,1.37-4.71,4c-0.4,2.99-0.06,6.02-0.18,9.03c-0.06,1.53,0.69,3.51-0.35,4.46c-0.95,0.87-2.88,0.22-4.38,0.23c-3.02,0.03-3.02,0.01-3.02-2.98c0-3.43,0.01-6.86,0-10.29c-0.01-2.54-1.29-4.18-3.44-4.44c-2.27-0.28-3.97,0.98-4.71,3.4c-0.36,1.18-0.28,2.37-0.28,3.56c-0.01,3.12-0.04,6.24,0.02,9.35c0.02,1.03-0.18,1.5-1.34,1.44c-1.71-0.1-3.43-0.06-5.14-0.01c-0.89,0.03-1.29-0.17-1.28-1.2c0.04-7.22,0.04-14.45,0.01-21.67c0-0.9,0.27-1.18,1.15-1.15c1.66,0.06,3.32,0.01,4.99,0.02C57.62,42.18,57.62,42.18,57.77,44.1z" />
        <path fill="#0A0A0A" d="M101.55,43.72c6.11-4.04,12.82-2.14,16.02,1.88c3.95,4.96,3.83,12.66-0.26,17.45c-3.51,4.1-10.34,5.29-15.57,1.64c-0.52,0.24-0.29,0.72-0.3,1.09c-0.02,2.91-0.04,5.82,0.01,8.73c0.02,0.98-0.25,1.4-1.32,1.35c-1.71-0.08-3.43-0.07-5.14,0c-0.92,0.03-1.3-0.22-1.29-1.21c0.02-10.49,0.02-20.98,0-31.48c0-0.74,0.22-1.01,0.98-0.99c1.92,0.04,3.85,0.09,5.76-0.02C101.65,42.08,101.35,42.96,101.55,43.72z M112.92,54.19c0.01-3.55-2.33-6.14-5.6-6.19c-3.26-0.05-5.87,2.67-5.9,6.14c-0.03,3.48,2.54,6.19,5.84,6.18C110.55,60.31,112.9,57.76,112.92,54.19z" />
        <path fill="#0C0C0C" d="M149.57,55.61c1.82-4.2,3.63-8.28,5.35-12.39c0.36-0.87,0.81-1.18,1.73-1.15c1.97,0.06,3.95,0.05,5.92,0.01c0.89-0.02,1.09,0.16,0.7,1.06c-4.55,10.48-9.06,20.97-13.56,31.47c-0.38,0.88-0.83,1.29-1.85,1.24c-1.87-0.09-3.74-0.05-5.61-0.01c-1.08,0.02-1.26-0.32-0.83-1.29c1.17-2.6,2.23-5.26,3.43-7.85c0.46-0.99,0.43-1.81,0.01-2.79c-2.93-6.77-5.78-13.56-8.73-20.32c-0.55-1.26-0.39-1.6,1-1.52c1.81,0.1,3.64,0.09,5.45,0c0.95-0.04,1.36,0.31,1.69,1.16c1.41,3.63,2.89,7.23,4.37,10.84C148.86,54.57,148.91,55.19,149.57,55.61z" />
        <path fill="#0C0C0C" d="M23.6,66.86c-2.2-0.04-4.76-0.35-7.09-1.67c-1.7-0.96-2.87-2.34-3.51-4.2c-0.28-0.83-0.15-1.23,0.77-1.39c1.89-0.33,3.78-0.72,5.64-1.16c0.63-0.15,0.77,0.12,1.03,0.58c1.06,1.85,3.72,2.67,5.71,1.79c0.69-0.3,1.31-0.74,1.28-1.6c-0.03-0.87-0.71-1.28-1.43-1.45c-1.97-0.45-3.97-0.78-5.95-1.22c-2.72-0.6-5.2-1.62-6.3-4.48c-1.4-3.66,0.3-7.78,4.15-9.42c4.33-1.85,8.71-1.71,12.89,0.63c1.59,0.89,2.67,2.26,3.35,3.97c0.32,0.8,0.32,1.21-0.69,1.36c-1.64,0.25-3.27,0.61-4.88,0.99c-0.73,0.17-1.07,0.01-1.45-0.68c-0.9-1.65-3.09-2.38-4.87-1.77c-0.79,0.27-1.38,0.77-1.38,1.68c0,0.89,0.63,1.3,1.37,1.47c2.03,0.45,4.07,0.81,6.1,1.27c4.72,1.07,7,4.08,6.43,8.41c-0.4,3.08-2.7,5.41-6.28,6.35C27.03,66.71,25.54,66.86,23.6,66.86z" />
        <path fill="#0C0C0C" d="M124.17,51.16c0-2.65,0.03-5.29-0.02-7.94c-0.02-0.89,0.27-1.18,1.15-1.15c1.76,0.05,3.53,0.08,5.29,0c1.07-0.05,1.29,0.35,1.28,1.34c-0.05,4.51-0.02,9.03-0.02,13.54c0,2.69,1.03,3.58,3.57,2.78c1.28-0.4,1.64-0.02,1.8,1.12c0.13,0.92,0.22,1.88,0.53,2.74c0.53,1.48-0.02,2.1-1.4,2.61c-4.82,1.75-9.65,0.15-11.46-3.93c-0.6-1.35-0.75-2.79-0.73-4.26C124.19,55.73,124.17,53.45,124.17,51.16z" />
        <path fill="#0A0A0A" d="M46.27,54.28c0,3.48-0.04,6.97,0.02,10.45c0.02,1.04-0.2,1.51-1.35,1.46c-1.71-0.09-3.43-0.06-5.14-0.01c-0.91,0.03-1.27-0.2-1.27-1.21c0.04-7.17,0.05-14.35,0-21.52c-0.01-1.07,0.35-1.33,1.34-1.28c1.66,0.07,3.33,0.1,4.99-0.01c1.23-0.08,1.46,0.4,1.44,1.52C46.23,47.21,46.27,50.74,46.27,54.28z" />
        <g>
          <rect x="116.56" y="23.53" fill="#0B89C4" width="15.18" height="7.75" />
          <polygon fill="#094D8C" points="131.74,23.53 123.99,31.38 123.99,39.3 131.74,39.3" />
        </g>
      </svg>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      if (data.user.role !== "HRD" && data.user.role !== "SUPER_ADMIN") {
        setError("Akun ini tidak memiliki akses Management Portal");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
      setLoading(false);
    }
  }

return (
  <div
    className="min-h-screen flex items-center justify-center px-4 relative"
    style={{
      backgroundImage: "url('/login-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(160deg, rgba(232,242,250,0.85) 0%, rgba(240,246,252,0.85) 50%, rgba(228,238,248,0.85) 100%)",
      }}
    />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(11,137,196,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,137,196,0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-[420px] relative">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(11,137,196,0.12) 0%, transparent 70%)" }}
        />

        <div
          className="rounded-2xl p-10 relative"
          style={{ background: "#ffffff", border: "1px solid #dde8f0", boxShadow: "0 16px 48px rgba(11,137,196,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-col items-center mb-8">
            <AdminLogo size={44} />
            <h1 className="mt-4 text-xl font-semibold tracking-tight" style={{ color: "#1a2a3a" }}>Simply HRIS</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: "#0873a8" }}>Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#6a8faa" }}>Email Administrator</label>
              <input
                type="email"
                className="admin-input"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#6a8faa" }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="admin-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#5a7d96", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 3l18 18M10.58 10.58A3 3 0 0016.42 13.4M6.5 6.5A10 10 0 002 12c2 4 6 7 10 7a10 10 0 004.5-1.05M9 9a3 3 0 014.24 4.24" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="6" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl text-white font-semibold text-[15px] transition-all"
              style={{
                background: "linear-gradient(135deg, #0B89C4, #094D8C)",
                boxShadow: "0 4px 20px rgba(11,137,196,0.35)",
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                "Masuk sebagai Admin"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid #dde8f0" }}>
            <p className="text-center text-xs" style={{ color: "#5a7d96" }}>Akses terbatas untuk administrator sistem</p>
          </div>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: "#7a9fba" }}>Simply HRIS · Admin Edition</p>
      </div>
    </div>
  );
}