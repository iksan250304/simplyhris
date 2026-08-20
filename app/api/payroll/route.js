import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, verifyPassword } from "@/lib/auth";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET: daftar slip gaji milik karyawan yang login
export async function GET(request) {
  const authUser = getUser(request);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payrolls = await prisma.payroll.findMany({
    where: { userId: authUser.id },
    include: { period: true, user: { select: { name: true, email: true, nik: true } } },
    orderBy: [{ period: { year: "desc" } }, { period: { month: "desc" } }],
  });

  return NextResponse.json({ payrolls });
}

// POST: re-autentikasi password sebelum akses menu payroll
export async function POST(request) {
  const authUser = getUser(request);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  return NextResponse.json({ verified: true });
}