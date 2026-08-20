import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isHRD(request) {
  const token = request.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

export async function GET(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.officeLocation.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ locations });
}

export async function POST(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, latitude, longitude, radius } = await request.json();
  if (!name || latitude == null || longitude == null || !radius) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const location = await prisma.officeLocation.create({
    data: {
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
    },
  });

  return NextResponse.json({ message: "Lokasi berhasil ditambahkan", location });
}