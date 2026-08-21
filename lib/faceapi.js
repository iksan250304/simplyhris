import * as faceapi from "face-api.js";

let modelsLoaded = false;
let loadingPromise = null;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

// Resize gambar besar jadi maksimal 320px lebar sebelum dideteksi — jauh lebih cepat
function resizeImage(imgElement, maxWidth = 320) {
  const scale = Math.min(1, maxWidth / imgElement.width);
  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width * scale;
  canvas.height = imgElement.height * scale;
  canvas.getContext("2d").drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function getFaceDescriptorFromImage(imgElement) {
  const resized = resizeImage(imgElement, 320);

  const detection = await faceapi
    .detectSingleFace(resized, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

export function compareDescriptors(descA, descB) {
  if (!descA || !descB || descA.length !== descB.length) return 0;
  let sum = 0;
  for (let i = 0; i < descA.length; i++) {
    sum += (descA[i] - descB[i]) ** 2;
  }
  const distance = Math.sqrt(sum);
  const similarity = Math.max(0, (1 - distance / 1.0)) * 100;
  return Math.min(100, similarity);
}