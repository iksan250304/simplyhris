# Simply HRIS - Spesifikasi

## Stack
Next.js (App Router, JS), Tailwind CSS, PostgreSQL (Supabase), Prisma ORM

## Portal
- `/login` : Karyawan (presensi, dispensasi, slip gaji)
- `/admin/login` : Admin/HRD (master data, radius/jam kerja, registrasi KTP, review dispensasi)
- Middleware RBAC: `/admin/*` hanya HRD/SUPER_ADMIN

## Attendance
- Dynamic Geofence: HRD set Lat/Lng/radius kantor, karyawan check-in via GPS (geolib)
- Face Recognition: cocokkan selfie vs foto KTP (face-api.js, similarity >= 80%)
- Jam Kerja Bulanan: per periode bulan/tahun
- Deteksi telat otomatis + form dispensasi (ACCEPT hapus denda / REJECT)

## Payroll
- Re-auth password sebelum akses menu payroll
- Komponen: Gaji Pokok, Tunjangan, Lembur, PPh21, BPJS, Denda Telat/Alpa
- Export PDF slip gaji (html2pdf.js) + banner CONFIDENTIAL/STRICTLY PRIVATE 