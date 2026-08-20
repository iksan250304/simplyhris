import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(request) {
  const authUser = getUser(request);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { selfieDescriptor } = await request.json();
  if (!selfieDescriptor) {
    return NextResponse.json({ error: "Data wajah tidak ditemukan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user?.faceEmbedding) {
    return NextResponse.json({ error: "Wajah belum terdaftar, hubungi HRD" }, { status: 400 });
  }

  const ktpDescriptor = user.faceEmbedding;
  let sum = 0;
  for (let i = 0; i < ktpDescriptor.length; i++) {
    sum += (ktpDescriptor[i] - selfieDescriptor[i]) ** 2;
  }
  const distance = Math.sqrt(sum);
  const similarity = Math.min(100, Math.max(0, (1 - distance / 1.0) * 100));

  return NextResponse.json({ similarity, match: similarity >= 30 });
}