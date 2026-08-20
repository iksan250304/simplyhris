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
  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const schedule = await prisma.workSchedule.findUnique({ where: { month_year: { month, year } } });
  return NextResponse.json({ schedule });
}

export async function POST(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { month, year, checkIn, checkOut } = await request.json();

  const schedule = await prisma.workSchedule.upsert({
    where: { month_year: { month, year } },
    update: { checkIn, checkOut },
    create: { month, year, checkIn, checkOut },
  });

  return NextResponse.json({ schedule });
}