import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { uploadBase64Image } from "@/lib/supabase";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, reason, proofBase64 } = await request.json();
  if (!date || !reason) {
    return NextResponse.json({ error: "Tanggal dan alasan wajib diisi" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: dateObj } },
  });

  if (existing?.checkInTime) {
    return NextResponse.json({ error: "Tanggal ini sudah ada presensi" }, { status: 400 });
  }

  let proofPath = existing?.dispensationProof || null;
  if (proofBase64) {
    try {
      proofPath = await uploadBase64Image(proofBase64, "dispensation-proofs", `alpa-${user.id}`);
    } catch (err) {
      return NextResponse.json({ error: "Gagal upload bukti: " + err.message }, { status: 500 });
    }
  }

  const attendance = await prisma.attendance.upsert({
    where: { userId_date: { userId: user.id, date: dateObj } },
    update: {
      dispensationStatus: "PENDING",
      dispensationReason: reason,
      dispensationProof: proofPath,
    },
    create: {
      userId: user.id,
      date: dateObj,
      dispensationStatus: "PENDING",
      dispensationReason: reason,
      dispensationProof: proofPath,
      isLate: false,
      lateMinutes: 0,
    },
  });

  return NextResponse.json({ message: "Pengajuan dispensasi terkirim", attendance });
}