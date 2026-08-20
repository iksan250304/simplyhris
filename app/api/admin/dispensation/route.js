import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getSignedUrl } from "@/lib/supabase";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function isHRD(user) {
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

export async function GET(request) {
  const user = getUser(request);
  if (!isHRD(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dispensations = await prisma.attendance.findMany({
    where: { dispensationStatus: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });

  const withSignedUrls = await Promise.all(
    dispensations.map(async (d) => ({
      ...d,
      dispensationProofUrl: await getSignedUrl("dispensation-proofs", d.dispensationProof),
      selfieUrl: await getSignedUrl("selfies", d.selfieUrl),
    }))
  );

  return NextResponse.json({ dispensations: withSignedUrls });
}

export async function POST(request) {
  const user = getUser(request);
  if (!isHRD(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attendanceId, action } = await request.json();
  if (!attendanceId || !["ACCEPT", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const status = action === "ACCEPT" ? "APPROVED" : "REJECTED";
  const attendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { dispensationStatus: status },
  });

  return NextResponse.json({ message: `Dispensasi ${status}`, attendance });
}