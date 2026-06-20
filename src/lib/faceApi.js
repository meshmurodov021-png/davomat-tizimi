import * as faceapi from 'face-api.js'

// Model fayllari public/models/ papkasidan yuklanadi
const MODELS_URL = '/models'

// Modellar bir marta yuklanadi, keyingi chaqiruvlarda xotiradan ishlatiladi
let modelsLoaded = false

// Uchta model kerak:
//   1. tinyFaceDetector     — yuzni aniqlash (engil model)
//   2. faceLandmark68TinyNet — yuz nuqtalari (ko'z, burun, og'iz joylashuvi)
//   3. faceRecognitionNet   — 128 o'lchamli tavsif vektori (descriptor)
export async function loadFaceModels() {
  if (modelsLoaded) return
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
  ])
  modelsLoaded = true
}

// Video elementidan yuzni topib, descriptor hisoblaydi
// Qaytaradi: Float32Array (128 qiymat) yoki null (yuz topilmasa)
export async function detectFaceDescriptor(videoElement) {
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,        // kattaroq = aniqroq, lekin sekinroq (160|224|320|416|608)
    scoreThreshold: 0.45,  // minimal ishonchlilik (0-1)
  })

  const result = await faceapi
    .detectSingleFace(videoElement, options)
    .withFaceLandmarks(true)   // true = tiny model ishlatiladi
    .withFaceDescriptor()

  if (!result) return null
  return result.descriptor     // Float32Array[128]
}

// Float32Array → JSON string (bazaga saqlash uchun)
// [0.123, -0.456, ...] → '[-0.123, -0.456, ...]'
export function serializeDescriptor(descriptor) {
  return JSON.stringify(Array.from(descriptor))
}

// JSON string → Float32Array (bazadan o'qib ishlatish uchun)
export function deserializeDescriptor(json) {
  if (!json) return null
  return new Float32Array(JSON.parse(json))
}
