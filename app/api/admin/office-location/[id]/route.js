import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isHRD(request) {
  const token = request.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

export async function PUT(request, { params }) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, latitude, longitude, radius } = await request.json();
  const location = await prisma.officeLocation.update({
    where: { id: params.id },
    data: {
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
    },
  });

  return NextResponse.json({ message: "Lokasi berhasil diperbarui", location });
}

export async function DELETE(request, { params }) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usingLocation = await prisma.user.findFirst({ where: { officeLocationId: params.id } });
  if (usingLocation) {
    return NextResponse.json(
      { error: "Lokasi masih digunakan oleh karyawan, pindahkan dulu sebelum menghapus" },
      { status: 400 }
    );
  }

  await prisma.officeLocation.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Lokasi dihapus" });
}