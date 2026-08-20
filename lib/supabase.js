import { createClient } from "@supabase/supabase-js";

// Tambahkan fallback string agar Vercel build tidak crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// Upload base64 image string ke bucket, return public/signed URL path
export async function uploadBase64Image(base64String, bucket, fileName) {
  const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error("Format base64 tidak valid");

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const ext = mimeType.split("/")[1] || "jpg";
  const path = `${fileName}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) throw error;

  return path; // simpan path ini di DB, bukan base64
}

// Generate signed URL sementara untuk menampilkan gambar private
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) return null;
  return data.signedUrl;
}