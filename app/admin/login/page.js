"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B89C4] to-[#094D8C] mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Simply HRIS</h1>
          <p className="text-sm text-[#0B89C4] mt-1 font-medium tracking-wide">Management Portal</p>
        </div>

        <div className="bg-[#0F1E33] rounded-2xl border border-slate-800 shadow-xl p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950 text-red-400 text-sm text-center border border-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B89C4] focus:border-transparent transition"
                placeholder="admin@perusahaan.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A1628] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B89C4] focus:border-transparent transition"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0B89C4] to-[#094D8C] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? "Memproses..." : "Masuk sebagai Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}