async function capture() {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

  // Langsung tampilkan hasil foto & matikan stream kamera, tanpa menunggu verifikasi
  setSelfie(dataUrl);
  setFaceState("captured");
  setFaceMsg("Foto tersimpan, memverifikasi...");
  streamRef.current?.getTracks().forEach((t) => t.stop());

  // Proses verifikasi berjalan di belakang layar
  try {
    const img = new Image();
    img.src = dataUrl;
    await new Promise((res) => (img.onload = res));

    const descriptor = await getFaceDescriptorFromImage(img);
    if (!descriptor) {
      setFaceState("error");
      setFaceMsg("Wajah tidak terdeteksi, coba lagi");
      return;
    }

    const res = await fetch("/api/attendance/verify-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfieDescriptor: descriptor }),
    });
    const data = await res.json();

    if (!res.ok || data.similarity < 50) {
      setFaceState("error");
      setFaceMsg(`Wajah tidak cocok (${data.similarity?.toFixed(1) || 0}%)`);
      return;
    }

    setFaceState("verified");
    setFaceMsg(`Wajah terverifikasi (${data.similarity.toFixed(1)}%)`);

    setTimeout(() => {
      setMode("idle");
      submitAttendance(dataUrl, mode);
    }, 400);
  } catch (err) {
    setFaceState("error");
    setFaceMsg("Gagal memverifikasi wajah");
  }
}