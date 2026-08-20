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

  let setting = await prisma.appSetting.findFirst();
  if (!setting) {
    setting = await prisma.appSetting.create({ data: {} });
  }

  return NextResponse.json({ setting });
}

export async function POST(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lateFinePerMinute } = await request.json();
  if (lateFinePerMinute == null || Number(lateFinePerMinute) < 0) {
    return NextResponse.json({ error: "Nominal denda tidak valid" }, { status: 400 });
  }

  const existing = await prisma.appSetting.findFirst();
  const setting = existing
    ? await prisma.appSetting.update({
        where: { id: existing.id },
        data: { lateFinePerMinute: Number(lateFinePerMinute) },
      })
    : await prisma.appSetting.create({
        data: { lateFinePerMinute: Number(lateFinePerMinute) },
      });

  return NextResponse.json({ message: "Nominal denda disimpan", setting });
}