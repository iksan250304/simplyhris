import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isHRD(request) {
  const token = request.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

async function getLateFineRate() {
  const setting = await prisma.appSetting.findFirst();
  return setting ? Number(setting.lateFinePerMinute) : 5000;
}

async function calculateLateDeduction(userId, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const lateAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: { gte: start, lt: end },
      isLate: true,
      dispensationStatus: { not: "APPROVED" },
    },
  });

  const totalLateMinutes = lateAttendances.reduce((sum, a) => sum + a.lateMinutes, 0);
  const rate = await getLateFineRate();
  return totalLateMinutes * rate;
}

// GET: preview data karyawan untuk 1 periode (belum tentu sudah digenerate)
export async function GET(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json({ error: "Bulan dan tahun wajib diisi" }, { status: 400 });
  }

  const period = await prisma.payrollPeriod.findUnique({ where: { month_year: { month, year } } });

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      email: true,
      baseSalary: true,
      allowance: true,
      bpjsPercent: true,
      taxPercent: true,
    },
  });

  const existingPayrolls = period
    ? await prisma.payroll.findMany({ where: { periodId: period.id } })
    : [];

  const rows = await Promise.all(
    employees.map(async (emp) => {
      const lateDeduction = await calculateLateDeduction(emp.id, month, year);
      const generated = existingPayrolls.find((p) => p.userId === emp.id) || null;
      return {
        userId: emp.id,
        name: emp.name,
        email: emp.email,
        baseSalary: emp.baseSalary,
        allowance: emp.allowance,
        bpjsPercent: emp.bpjsPercent,
        taxPercent: emp.taxPercent,
        lateDeduction,
        generated,
      };
    })
  );

  return NextResponse.json({ period, rows });
}

// POST: generate/update payroll 1 karyawan untuk periode tertentu
export async function POST(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { month, year, userId, overtimePay } = await request.json();

  if (!month || !year || !userId) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const period = await prisma.payrollPeriod.upsert({
    where: { month_year: { month, year } },
    update: {},
    create: { month, year },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });
  }

  const baseSalary = Number(user.baseSalary || 0);
  const allowance = Number(user.allowance || 0);
  const bpjsPercent = Number(user.bpjsPercent || 0);
  const taxPercent = Number(user.taxPercent || 0);
  const overtime = Number(overtimePay || 0);

  const lateDeduction = await calculateLateDeduction(userId, month, year);
  const bpjsDeduction = Math.round((baseSalary * bpjsPercent) / 100);
  const taxDeduction = Math.round((baseSalary * taxPercent) / 100);
  const totalDeduction = bpjsDeduction + taxDeduction + lateDeduction;
  const netSalary = baseSalary + allowance + overtime - totalDeduction;

  const payroll = await prisma.payroll.upsert({
    where: { userId_periodId: { userId, periodId: period.id } },
    update: {
      baseSalary,
      allowance,
      overtimePay: overtime,
      taxDeduction,
      bpjsDeduction,
      lateDeduction,
      totalDeduction,
      netSalary,
    },
    create: {
      userId,
      periodId: period.id,
      baseSalary,
      allowance,
      overtimePay: overtime,
      taxDeduction,
      bpjsDeduction,
      lateDeduction,
      totalDeduction,
      netSalary,
    },
  });

  return NextResponse.json({ message: "Slip gaji berhasil digenerate", payroll });
}