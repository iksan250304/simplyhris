import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getDistance } from "geolib";
import { uploadBase64Image } from "@/lib/supabase";

function getUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end, now };
}

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { start, end } = todayRange();
  const attendance = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: start, lt: end } },
  });

  return NextResponse.json({ attendance });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, latitude, longitude, selfieBase64, lateReason, lateProofBase64 } =
    await request.json();

  if (type !== "checkin" && type !== "checkout") {
    return NextResponse.json({ error: "Tipe presensi tidak valid" }, { status: 400 });
  }
  if (latitude == null || longitude == null) {
    return NextResponse.json({ error: "Lokasi GPS tidak ditemukan" }, { status: 400 });
  }

 const employee = await prisma.user.findUnique({
  where: { id: user.id },
  include: { officeLocation: true },
});

if (!employee?.officeLocation) {
  return NextResponse.json(
    { error: "Anda belum ditempatkan di lokasi manapun, hubungi HRD" },
    { status: 400 }
  );
}

const office = employee.officeLocation;
  const distance = getDistance(
    { latitude, longitude },
    { latitude: Number(office.latitude), longitude: Number(office.longitude) }
  );
  if (distance > office.radius) {
    return NextResponse.json(
      { error: `Diluar radius kantor (jarak ${distance}m, radius ${office.radius}m)` },
      { status: 403 }
    );
  }

  const { start, now } = todayRange();
  const existing = await prisma.attendance.findFirst({
    where: { userId: user.id, date: start },
  });

  if (type === "checkin") {
    if (existing?.checkInTime) {
      return NextResponse.json({ error: "Sudah check-in hari ini" }, { status: 400 });
    }

    const schedule = await prisma.workSchedule.findUnique({
      where: { month_year: { month: now.getMonth() + 1, year: now.getFullYear() } },
    });

    let isLate = false;
    let lateMinutes = 0;

    if (schedule) {
      const [h, m] = schedule.checkIn.split(":").map(Number);
      const scheduled = new Date(start);
      scheduled.setHours(h, m, 0, 0);
      if (now > scheduled) {
        isLate = true;
        lateMinutes = Math.round((now - scheduled) / 60000);
      }
    }

    if (isLate && !lateReason) {
      return NextResponse.json(
        { needDispensation: true, lateMinutes, message: "Anda terlambat, isi alasan keterlambatan" },
        { status: 202 }
      );
    }

    let selfiePath = null;
    if (selfieBase64) {
      try {
        selfiePath = await uploadBase64Image(selfieBase64, "selfies", `selfie-${user.id}`);
      } catch (err) {
        return NextResponse.json({ error: "Gagal upload selfie: " + err.message }, { status: 500 });
      }
    }

    let proofPath = null;
    if (lateProofBase64) {
      try {
        proofPath = await uploadBase64Image(lateProofBase64, "dispensation-proofs", `proof-${user.id}`);
      } catch (err) {
        return NextResponse.json({ error: "Gagal upload bukti: " + err.message }, { status: 500 });
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: { userId_date: { userId: user.id, date: start } },
      update: {
        checkInTime: now,
        checkInLat: latitude,
        checkInLng: longitude,
        selfieUrl: selfiePath,
        isLate,
        lateMinutes,
        dispensationStatus: isLate ? "PENDING" : "NONE",
        dispensationReason: lateReason || null,
        dispensationProof: proofPath,
      },
      create: {
        userId: user.id,
        date: start,
        checkInTime: now,
        checkInLat: latitude,
        checkInLng: longitude,
        selfieUrl: selfiePath,
        isLate,
        lateMinutes,
        dispensationStatus: isLate ? "PENDING" : "NONE",
        dispensationReason: lateReason || null,
        dispensationProof: proofPath,
      },
    });

    return NextResponse.json({ message: "Check-in berhasil", attendance });
  }

  // checkout
  if (!existing?.checkInTime) {
    return NextResponse.json({ error: "Belum check-in hari ini" }, { status: 400 });
  }
  if (existing.checkOutTime) {
    return NextResponse.json({ error: "Sudah check-out hari ini" }, { status: 400 });
  }

  const attendance = await prisma.attendance.update({
    where: { userId_date: { userId: user.id, date: start } },
    data: { checkOutTime: now },
  });

  return NextResponse.json({ message: "Check-out berhasil", attendance });
}