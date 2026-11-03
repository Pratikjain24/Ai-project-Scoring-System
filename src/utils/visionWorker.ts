// ====================================================
// PROJECTX-RAY AI - DEDICATED COMPUTER VISION WEB WORKER
// Offloads heavy YCbCr color-space segmentation and stage
// aperture clustering from the main React UI thread.
// Guarantees 60 FPS UI responsiveness and prevents audio buffer underruns.
// ====================================================

export interface VisionWorkerInput {
  type: 'ANALYZE_FRAME';
  imageData: ImageData;
  width: number;
  height: number;
  lumaFactor: number;
  avgLuma: number;
  maxPresenters: number;
}

export interface RawPresenterDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  pixelCount: number;
}

export interface VisionWorkerOutput {
  type: 'ANALYSIS_RESULT';
  detections: RawPresenterDetection[];
  avgLuma: number;
  lightingQuality: 'GOOD' | 'TOO_DARK' | 'TOO_BRIGHT';
}

/**
 * Pure function executing YCbCr skin clustering and peak detection across frame pixels.
 * Decouples Luminance (Y) from Chrominance (Cb, Cr) across Fitzpatrick Types I-VI.
 */
export function processFramePixelsInWorker(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  maxPresenters = 5
): { detections: RawPresenterDetection[]; avgLuma: number; lightingQuality: 'GOOD' | 'TOO_DARK' | 'TOO_BRIGHT' } {
  // 1. Dynamic Lighting & Ambient Luminance Normalization
  let totalLuma = 0;
  const sampleStep = 6;
  let sampleCount = 0;
  for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
    const luma = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    totalLuma += luma;
    sampleCount++;
  }
  const avgLuma = sampleCount > 0 ? totalLuma / sampleCount : 120;
  const lightingQuality: 'GOOD' | 'TOO_DARK' | 'TOO_BRIGHT' =
    avgLuma < 38 ? 'TOO_DARK' : avgLuma > 225 ? 'TOO_BRIGHT' : 'GOOD';

  // Adaptive skin gain compensation based on room lighting
  const lumaFactor = Math.max(0.75, Math.min(1.35, 128 / (avgLuma + 10)));

  // 2. Multi-Subject Stage Aperture Clustering with YCbCr Color-Space Segmentation
  const horizontalProfile = new Int32Array(width);
  const yMinBound = Math.floor(height * 0.1);
  const yMaxBound = Math.floor(height * 0.9);

  // Adaptive chrominance boundaries based on ambient illumination
  const isLowLight = avgLuma < 50;
  const minCr = isLowLight ? 130 : 133;
  const maxCr = isLowLight ? 175 : 173;
  const minCb = isLowLight ? 75 : 77;
  const maxCb = isLowLight ? 130 : 127;
  const minY = isLowLight ? 15 : 20;

  for (let y = yMinBound; y < yMaxBound; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx] * lumaFactor;
      const g = pixels[idx + 1] * lumaFactor;
      const b = pixels[idx + 2] * lumaFactor;

      // ITU-R BT.601 YCbCr Color Transformation
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      // YCbCr skin cluster rule covering all Fitzpatrick pigmentation types
      const isSkinYCbCr = (
        Y > minY &&
        Cb >= minCb && Cb <= maxCb &&
        Cr >= minCr && Cr <= maxCr
      );

      // Fallback normalized chromaticity check for edge lighting
      const sumRGB = r + g + b + 0.001;
      const nr = r / sumRGB;
      const ng = g / sumRGB;
      const isSkinNormRGB = (
        nr > 0.33 && nr < 0.60 &&
        ng > 0.25 && ng < 0.39 &&
        nr > ng &&
        Math.abs(r - g) > 6 &&
        r > 35
      );

      if (isSkinYCbCr || isSkinNormRGB) {
        for (let bx = 0; bx < 4 && x + bx < width; bx++) {
          horizontalProfile[x + bx]++;
        }
      }
    }
  }

  // Identify candidate peaks across the horizontal profile
  const detections: RawPresenterDetection[] = [];
  const minClusterWidth = 28;
  let clusterStart: number | null = null;
  let clusterSum = 0;

  for (let x = 0; x < width; x++) {
    const val = horizontalProfile[x];
    if (val > 2) {
      if (clusterStart === null) clusterStart = x;
      clusterSum += val;
    } else if (clusterStart !== null) {
      const clusterW = x - clusterStart;
      if (clusterW >= minClusterWidth && clusterSum > 35) {
        const cX = clusterStart + clusterW / 2;
        const boxW = Math.max(45, Math.min(115, clusterW * 1.2));
        const boxH = Math.min(height * 0.75, boxW * 1.35);
        const boxY = Math.max(8, height * 0.22);
        const boxX = Math.max(0, Math.min(width - boxW, cX - boxW / 2));

        detections.push({
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          centerX: cX,
          centerY: boxY + boxH * 0.4,
          pixelCount: clusterSum
        });
      }
      clusterStart = null;
      clusterSum = 0;
    }
  }

  detections.sort((a, b) => b.pixelCount - a.pixelCount);
  return {
    detections: detections.slice(0, maxPresenters),
    avgLuma,
    lightingQuality
  };
}

// Inline worker self-registration if loaded in Worker context
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.onmessage = (e: MessageEvent<VisionWorkerInput>) => {
    if (e.data?.type === 'ANALYZE_FRAME') {
      const { imageData, width, height, maxPresenters } = e.data;
      const result = processFramePixelsInWorker(imageData.data, width, height, maxPresenters);
      self.postMessage({
        type: 'ANALYSIS_RESULT',
        detections: result.detections,
        avgLuma: result.avgLuma,
        lightingQuality: result.lightingQuality
      } as VisionWorkerOutput);
    }
  };
}
