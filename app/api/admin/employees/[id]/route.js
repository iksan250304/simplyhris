import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isHRD(request) {
  const token = request.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

export async function DELETE(request, { params }) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.$transaction([
      prisma.payroll.deleteMany({ where: { userId: params.id } }),
      prisma.attendance.deleteMany({ where: { userId: params.id } }),
      prisma.user.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ message: "Karyawan dihapus" });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menghapus karyawan: " + err.message }, { status: 500 });
  }
}