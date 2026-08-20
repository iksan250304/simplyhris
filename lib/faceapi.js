import * as faceapi from "face-api.js";

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

export async function getFaceDescriptorFromImage(imgElement) {
  const detection = await faceapi
    .detectSingleFace(imgElement, new faceapi.TinyFaceDetectorOptions())
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