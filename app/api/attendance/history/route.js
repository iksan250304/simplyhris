import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  if (!month || !year) {
    return NextResponse.json({ error: "Bulan dan tahun wajib diisi" }, { status: 400 });
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const records = await prisma.attendance.findMany({
    where: { userId: user.id, date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  const recordMap = {};
  records.forEach((r) => {
    recordMap[r.date.toISOString().slice(0, 10)] = r;
  });

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const lastDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();

  const days = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month - 1, d);
    const key = dateObj.toISOString().slice(0, 10);
    const record = recordMap[key] || null;

    let status = "TIDAK_HADIR";
    if (record?.checkInTime) status = record.checkOutTime ? "HADIR" : "BELUM_CHECKOUT";

    days.push({
      date: key,
      checkInTime: record?.checkInTime || null,
      checkOutTime: record?.checkOutTime || null,
      isLate: record?.isLate || false,
      lateMinutes: record?.lateMinutes || 0,
      dispensationStatus: record?.dispensationStatus || "NONE",
      dispensationReason: record?.dispensationReason || null,
      attendanceId: record?.id || null,
      status,
    });
  }

  const today = now.toISOString().slice(0, 10);
  const todayRecord = recordMap[today] || null;
  const reminders = {
    belumCheckIn: isCurrentMonth && !todayRecord?.checkInTime,
    belumCheckOut: isCurrentMonth && !!todayRecord?.checkInTime && !todayRecord?.checkOutTime,
    telatHariIni: isCurrentMonth && !!todayRecord?.isLate,
  };

  return NextResponse.json({ days, reminders });
}