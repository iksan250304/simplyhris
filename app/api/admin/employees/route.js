import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { uploadBase64Image, getSignedUrl } from "@/lib/supabase";

function isHRD(request) {
  const token = request.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  return user && (user.role === "HRD" || user.role === "SUPER_ADMIN");
}

export async function GET(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      email: true,
      nik: true,
      ktpPhotoUrl: true,
      baseSalary: true,
      allowance: true,
      bpjsPercent: true,
      taxPercent: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const withSignedUrls = await Promise.all(
    employees.map(async (emp) => ({
      ...emp,
      ktpPhotoUrl: await getSignedUrl("ktp-photos", emp.ktpPhotoUrl),
    }))
  );

  return NextResponse.json({ employees: withSignedUrls });
}

export async function POST(request) {
  if (!isHRD(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const {
  name,
  email,
  password,
  nik,
  ktpPhotoBase64,
  faceEmbedding,
  baseSalary,
  allowance,
  bpjsPercent,
  taxPercent,
  officeLocationId,
} = await request.json();

if (!officeLocationId) {
  return NextResponse.json({ error: "Lokasi penempatan wajib dipilih" }, { status: 400 });
}

  if (!name || !email || !password || !nik || !ktpPhotoBase64) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  if (!faceEmbedding || !Array.isArray(faceEmbedding)) {
    return NextResponse.json({ error: "Data wajah KTP belum terverifikasi" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { nik }] },
  });
  if (existing) {
    return NextResponse.json({ error: "Email atau NIK sudah terdaftar" }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  let ktpPath;
  try {
    ktpPath = await uploadBase64Image(ktpPhotoBase64, "ktp-photos", `ktp-${nik}`);
  } catch (err) {
    return NextResponse.json({ error: "Gagal upload foto KTP: " + err.message }, { status: 500 });
  }

const employee = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: "EMPLOYEE",
    nik,
    ktpPhotoUrl: ktpPath,
    faceEmbedding,
    officeLocationId,
    baseSalary: baseSalary ? Number(baseSalary) : 0,
    allowance: allowance ? Number(allowance) : 0,
    bpjsPercent: bpjsPercent ? Number(bpjsPercent) : 4,
    taxPercent: taxPercent ? Number(taxPercent) : 5,
  },
});

const employees = await prisma.user.findMany({
  where: { role: "EMPLOYEE" },
  select: {
    id: true,
    name: true,
    email: true,
    nik: true,
    ktpPhotoUrl: true,
    baseSalary: true,
    allowance: true,
    bpjsPercent: true,
    taxPercent: true,
    createdAt: true,
    officeLocation: { select: { id: true, name: true } },
  },
  orderBy: { createdAt: "desc" },
});

  return NextResponse.json({ message: "Karyawan berhasil didaftarkan", employeeId: employee.id });
}